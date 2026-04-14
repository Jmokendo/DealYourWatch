import { isApiMockMode } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api/http";
import type { OfferDto, PatchOfferBody } from "@/lib/api/contracts";
import {
  mockListings,
  mockNegotiationsByListing,
  mockNegotiationById,
  mockOffersByNegotiation,
} from "@/lib/api/mock-data";
import {
  isNegotiationParticipant,
  loadNegotiationWithSeller,
  mockListingSellerId,
} from "@/lib/api/negotiation-access";
import { getUserIdFromCookie } from "@/lib/getUser";

type ApiError = Error & { statusCode: number };

function apiError(message: string, statusCode: number): ApiError {
  const err = new Error(message) as ApiError;
  err.statusCode = statusCode;
  return err;
}

function getStatusCode(e: unknown): number | null {
  if (typeof e !== "object" || e === null) return null;
  if (!("statusCode" in e)) return null;
  const sc = (e as { statusCode?: unknown }).statusCode;
  return typeof sc === "number" && Number.isFinite(sc) ? sc : null;
}

function toOfferDto(o: {
  id: string;
  negotiationId: string;
  userId: string;
  amount: { toString(): string };
  currency: string;
  reasonType: string;
  reasonNote: string | null;
  status: OfferDto["status"];
  createdAt: Date;
}): OfferDto {
  return {
    id: o.id,
    negotiationId: o.negotiationId,
    userId: o.userId,
    amount: o.amount.toString(),
    currency: o.currency,
    reasonType: o.reasonType,
    reasonNote: o.reasonNote,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
  };
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string; offerId: string }> },
) {
  const userId = (await getUserIdFromCookie()) || "dev-user-1";

  const { id: negotiationId, offerId } = await ctx.params;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }
  const o = raw as Record<string, unknown>;
  const action = o.action;
  if (action !== "accept" && action !== "reject" && action !== "counter") {
    return jsonError("action must be accept, reject, or counter", 400);
  }
  const body: PatchOfferBody = {
    action,
    amount:
      typeof o.amount === "number"
        ? o.amount
        : Number.parseFloat(String(o.amount ?? "")),
    note: typeof o.note === "string" ? o.note : undefined,
    currency: typeof o.currency === "string" ? o.currency : undefined,
  };

  if (body.action === "counter") {
    if (!Number.isFinite(body.amount) || (body.amount as number) <= 0) {
      return jsonError("amount must be a positive number for counter", 400);
    }
  }

  if (isApiMockMode()) {
    const neg = mockNegotiationById[negotiationId];
    if (!neg) return jsonError("Negotiation not found", 404);
    const sellerId = mockListingSellerId(neg.listingId);
    if (!sellerId) return jsonError("Listing not found", 404);
    const listing = mockListings.find((l) => l.id === neg.listingId);
    if (!listing) return jsonError("Listing not found", 404);
    if (
      !isNegotiationParticipant(userId, neg.buyerId, sellerId)
    ) {
      return jsonError("Forbidden", 403);
    }
    if (listing.status === "SOLD") {
      return jsonError("Listing is sold", 409);
    }
    if (neg.status !== "ACTIVE") {
      return jsonError("Negotiation is not active", 409);
    }

    const offers = mockOffersByNegotiation[negotiationId] ?? [];
    const idx = offers.findIndex((x) => x.id === offerId);
    if (idx === -1) return jsonError("Offer not found", 404);
    const offer = offers[idx];
    if (offer.status !== "PENDING") {
      return jsonError("Offer is not pending", 409);
    }
    if (offer.userId === userId) {
      return jsonError("Cannot respond to your own offer", 403);
    }

    if (body.action === "accept") {
      offer.status = "ACCEPTED";
      neg.status = "ACCEPTED";
      neg.updatedAt = new Date().toISOString();
      listing.status = "SOLD";
      listing.updatedAt = new Date().toISOString();
      // Expire all other active negotiations for this listing.
      for (const other of mockNegotiationsByListing[neg.listingId] ?? []) {
        if (other.id !== neg.id && other.status === "ACTIVE") {
          other.status = "EXPIRED";
          other.updatedAt = new Date().toISOString();
          mockNegotiationById[other.id] = other;
        }
      }
      return jsonOk({ offer: { ...offer } });
    }

    if (body.action === "reject") {
      offer.status = "REJECTED";
      neg.status = "REJECTED";
      neg.updatedAt = new Date().toISOString();
      return jsonOk({ offer: { ...offer } });
    }

    if (body.action === "counter") {
      offer.status = "COUNTERED";
      const now = new Date().toISOString();
      const counter: OfferDto = {
        id: `mock-offer-${Date.now()}`,
        negotiationId,
        userId,
        amount: (body.amount as number).toFixed(2),
        currency: body.currency ?? "USD",
        reasonType: "COUNTER",
        reasonNote: body.note ?? null,
        status: "PENDING",
        createdAt: now,
      };
      offers.push(counter);
      neg.round += 1;
      neg.updatedAt = now;
      return jsonOk({ offer: counter });
    }
  }

  const db = getPrisma();
  if (!db) return jsonError("Database not configured", 503);

  const neg = await loadNegotiationWithSeller(db, negotiationId);
  if (!neg) return jsonError("Negotiation not found", 404);

  const sellerId = neg.listing.userId;
  if (!isNegotiationParticipant(userId, neg.buyerId, sellerId)) {
    return jsonError("Forbidden", 403);
  }
  if (neg.listing.status === "SOLD") {
    return jsonError("Listing is sold", 409);
  }
  if (neg.status !== "ACTIVE") {
    return jsonError("Negotiation is not active", 409);
  }

  const existing = await db.offer.findFirst({
    where: { id: offerId, negotiationId },
  });
  if (!existing) return jsonError("Offer not found", 404);
  if (existing.status !== "PENDING") {
    return jsonError("Offer is not pending", 409);
  }
  if (existing.userId === userId) {
    return jsonError("Cannot respond to your own offer", 403);
  }

  if (body.action === "accept") {
    try {
      const updatedOffer = await db.$transaction(async (tx) => {
        const fullNeg = await tx.negotiation.findUnique({
          where: { id: negotiationId },
          select: { id: true, status: true, listingId: true },
        });
        if (!fullNeg) {
          throw apiError("Negotiation not found", 404);
        }

        const listing = await tx.listing.findUnique({
          where: { id: fullNeg.listingId },
          select: { id: true, status: true, userId: true },
        });
        if (!listing) {
          throw apiError("Listing not found", 404);
        }
        if (listing.status === "SOLD") {
          throw apiError("Listing is sold", 409);
        }

        const otherAccepted = await tx.negotiation.findFirst({
          where: {
            listingId: fullNeg.listingId,
            status: "ACCEPTED",
            NOT: { id: negotiationId },
          },
          select: { id: true },
        });
        if (otherAccepted) {
          throw apiError("Listing already has an accepted negotiation", 409);
        }

        const offerUpdated = await tx.offer.updateMany({
          where: { id: offerId, negotiationId, status: "PENDING" },
          data: { status: "ACCEPTED" },
        });
        if (offerUpdated.count !== 1) {
          throw apiError("Offer is not pending", 409);
        }

        const negUpdated = await tx.negotiation.updateMany({
          where: { id: negotiationId, status: "ACTIVE" },
          data: { status: "ACCEPTED" },
        });
        if (negUpdated.count !== 1) {
          throw apiError("Negotiation is not active", 409);
        }

        const listingUpdated = await tx.listing.updateMany({
          where: { id: fullNeg.listingId, status: { not: "SOLD" } },
          data: { status: "SOLD", soldAt: new Date() },
        });
        if (listingUpdated.count !== 1) {
          throw apiError("Listing is sold", 409);
        }

        const existingSale = await tx.sale.findUnique({
          where: { listingId: fullNeg.listingId },
          select: { id: true },
        });
        if (existingSale) {
          throw apiError("Sale already exists for listing", 409);
        }

        await tx.sale.create({
          data: {
            listingId: fullNeg.listingId,
            buyerId: neg.buyerId,
            sellerId: listing.userId,
            finalPrice: existing.amount,
            currency: existing.currency,
          },
        });

        await tx.negotiation.updateMany({
          where: {
            listingId: fullNeg.listingId,
            status: "ACTIVE",
            NOT: { id: negotiationId },
          },
          data: { status: "EXPIRED" },
        });

        return tx.offer.findUniqueOrThrow({ where: { id: offerId } });
      });

      return jsonOk({ offer: toOfferDto(updatedOffer) });
    } catch (e) {
      const statusCode = getStatusCode(e);
      const msg = e instanceof Error ? e.message : "Failed to accept offer";
      return jsonError(msg, statusCode ?? 500);
    }
  }

  if (body.action === "reject") {
    const [updatedOffer] = await db.$transaction([
      db.offer.update({
        where: { id: offerId },
        data: { status: "REJECTED" },
      }),
      db.negotiation.update({
        where: { id: negotiationId },
        data: { status: "REJECTED" },
      }),
    ]);
    return jsonOk({ offer: toOfferDto(updatedOffer) });
  }

  const counter = await db.$transaction(async (tx) => {
    await tx.offer.update({
      where: { id: offerId },
      data: { status: "COUNTERED" },
    });
    const newOffer = await tx.offer.create({
      data: {
        negotiationId,
        userId,
        amount: body.amount as number,
        currency: body.currency ?? "USD",
        reasonType: "COUNTER",
        reasonNote: body.note,
        status: "PENDING",
      },
    });
    await tx.negotiation.update({
      where: { id: negotiationId },
      data: { round: { increment: 1 } },
    });
    return newOffer;
  });

  return jsonOk({
    offer: toOfferDto(counter),
  });
}
