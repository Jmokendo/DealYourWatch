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
import { auth } from "@/lib/auth";
import { toOfferDto } from "@/lib/api/serialize-offer";
import { acceptOffer } from "@/lib/services/offer-service";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string; offerId: string }> },
) {
  const session = await auth();
  if (!session) return jsonError("Unauthorized", 401);
  const userId = session.user.id;

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
    if (!isNegotiationParticipant(userId, neg.buyerId, sellerId)) {
      return jsonError("Forbidden", 403);
    }
    if (listing.status === "SOLD") return jsonError("Listing is sold", 409);
    if (neg.status !== "ACTIVE") return jsonError("Negotiation is not active", 409);

    const offers = mockOffersByNegotiation[negotiationId] ?? [];
    const idx = offers.findIndex((x) => x.id === offerId);
    if (idx === -1) return jsonError("Offer not found", 404);
    const offer = offers[idx];
    if (offer.status !== "PENDING") return jsonError("Offer is not pending", 409);
    if (offer.userId === userId) return jsonError("Cannot respond to your own offer", 403);

    if (body.action === "accept") {
      offer.status = "ACCEPTED";
      neg.status = "CLOSED";
      neg.updatedAt = new Date().toISOString();
      listing.status = "SOLD";
      listing.updatedAt = new Date().toISOString();
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

  if (body.action === "accept") {
    const result = await acceptOffer(db, negotiationId, offerId, userId);
    if (!result.ok) return jsonError(result.error, result.status);
    return jsonOk({ offer: result.data });
  }

  const neg = await loadNegotiationWithSeller(db, negotiationId);
  if (!neg) return jsonError("Negotiation not found", 404);
  if (!isNegotiationParticipant(userId, neg.buyerId, neg.listing.userId)) {
    return jsonError("Forbidden", 403);
  }
  if (neg.listing.status === "SOLD") return jsonError("Listing is sold", 409);
  if (neg.status !== "ACTIVE") return jsonError("Negotiation is not active", 409);

  const existing = await db.offer.findFirst({ where: { id: offerId, negotiationId } });
  if (!existing) return jsonError("Offer not found", 404);
  if (existing.status !== "PENDING") return jsonError("Offer is not pending", 409);
  if (existing.userId === userId) return jsonError("Cannot respond to your own offer", 403);

  if (body.action === "reject") {
    const [updatedOffer] = await db.$transaction([
      db.offer.update({ where: { id: offerId }, data: { status: "REJECTED" } }),
      db.negotiation.update({ where: { id: negotiationId }, data: { status: "REJECTED" } }),
    ]);
    return jsonOk({ offer: toOfferDto(updatedOffer) });
  }

  const counter = await db.$transaction(async (tx) => {
    await tx.offer.update({ where: { id: offerId }, data: { status: "COUNTERED" } });
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

  return jsonOk({ offer: toOfferDto(counter) });
}
