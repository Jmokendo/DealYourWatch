import { isApiMockMode } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api/http";
import type { CreateOfferBody, OfferDto } from "@/lib/api/contracts";
import { auth } from "@/lib/auth";
import {
  mockListings,
  mockNegotiationById,
  mockOffersByNegotiation,
} from "@/lib/api/mock-data";
import {
  isNegotiationParticipant,
  loadNegotiationWithSeller,
  mockListingSellerId,
} from "@/lib/api/negotiation-access";
import { sendEmail, createNewOfferEmail } from "@/lib/email";
import { toOfferDto } from "@/lib/api/serialize-offer";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) return jsonError("Unauthorized", 401);
  const userId = session.user.id;

  const { id } = await ctx.params;

  if (isApiMockMode()) {
    const neg = mockNegotiationById[id];
    if (!neg) return jsonError("Negotiation not found", 404);
    const sellerId = mockListingSellerId(neg.listingId);
    if (!sellerId) return jsonError("Listing not found", 404);
    if (!isNegotiationParticipant(userId, neg.buyerId, sellerId)) {
      return jsonError("Forbidden", 403);
    }
    return jsonOk([...(mockOffersByNegotiation[id] ?? [])]);
  }

  const db = getPrisma();
  if (!db) return jsonError("Database not configured", 503);

  const neg = await loadNegotiationWithSeller(db, id);
  if (!neg) return jsonError("Negotiation not found", 404);
  const sellerId = neg.listing.userId;
  if (!isNegotiationParticipant(userId, neg.buyerId, sellerId)) {
    return jsonError("Forbidden", 403);
  }

  const rows = await db.offer.findMany({
    where: { negotiationId: id },
    orderBy: { createdAt: "asc" },
  });
  return jsonOk(rows.map(toOfferDto));
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) return jsonError("Unauthorized", 401);
  const userId = session.user.id;

  const { id } = await ctx.params;
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }
  const o = raw as Record<string, unknown>;
  const reasonTypeRaw =
    typeof o.reasonType === "string" ? o.reasonType.trim() : "";
  const reasonType = reasonTypeRaw || "OFFER";
  const amount =
    typeof o.amount === "number" ? o.amount : Number.parseFloat(String(o.amount));

  if (!Number.isFinite(amount) || amount <= 0) {
    return jsonError("amount must be a positive number", 400);
  }

  const body: CreateOfferBody = {
    amount,
    reasonType,
    reasonNote: typeof o.reasonNote === "string" ? o.reasonNote : undefined,
    currency: typeof o.currency === "string" ? o.currency : undefined,
  };
  const resolvedReasonType = body.reasonType ?? "OFFER";

  if (isApiMockMode()) {
    const neg = mockNegotiationById[id];
    if (!neg) return jsonError("Negotiation not found", 404);
    const sellerId = mockListingSellerId(neg.listingId);
    if (!sellerId) return jsonError("Listing not found", 404);
    if (!isNegotiationParticipant(userId, neg.buyerId, sellerId)) {
      return jsonError("Forbidden", 403);
    }
    if (neg.status !== "ACTIVE") {
      return jsonError("Negotiation is not active", 409);
    }
    // Best-effort mock-mode guard: prevent offers on SOLD listings.
    const listing = mockListings.find((l) => l.id === neg.listingId);
    if (listing?.status === "SOLD") {
      return jsonError("Listing is sold", 409);
    }
    const existing = mockOffersByNegotiation[id] ?? [];
    if (existing.length > 0) {
      return jsonError(
        "Resolve the pending offer first (accept, reject, or counter)",
        409,
      );
    }
    if (userId !== neg.buyerId) {
      return jsonError("Only the buyer can place the opening offer", 403);
    }

    const now = new Date().toISOString();
    const offer: OfferDto = {
      id: `mock-offer-${Date.now()}`,
      negotiationId: id,
      userId,
      amount: amount.toFixed(2),
      currency: body.currency ?? "USD",
      reasonType: resolvedReasonType,
      reasonNote: body.reasonNote ?? null,
      status: "PENDING",
      createdAt: now,
    };
    if (!mockOffersByNegotiation[id]) mockOffersByNegotiation[id] = [];
    mockOffersByNegotiation[id].push(offer);
    return jsonOk(offer, { status: 201 });
  }

  const db = getPrisma();
  if (!db) return jsonError("Database not configured", 503);

  const neg = await loadNegotiationWithSeller(db, id);
  if (!neg) return jsonError("Negotiation not found", 404);
  if (neg.listing.status === "SOLD") {
    return jsonError("Listing is sold", 409);
  }
  const sellerId = neg.listing.userId;
  if (!isNegotiationParticipant(userId, neg.buyerId, sellerId)) {
    return jsonError("Forbidden", 403);
  }
  if (neg.status !== "ACTIVE") {
    return jsonError("Negotiation is not active", 409);
  }

  const offerCount = await db.offer.count({ where: { negotiationId: id } });
  if (offerCount > 0) {
    return jsonError(
      "Resolve the pending offer first (accept, reject, or counter)",
      409,
    );
  }
  if (userId !== neg.buyerId) {
    return jsonError("Only the buyer can place the opening offer", 403);
  }

  const row = await db.offer.create({
    data: {
      negotiationId: id,
      userId,
      amount: body.amount,
      currency: body.currency ?? "USD",
      reasonType: resolvedReasonType,
      reasonNote: body.reasonNote,
    },
  });

  // Send notification email to the seller
  const negotiation = await db.negotiation.findUnique({
    where: { id },
    include: {
      listing: { include: { user: true } },
      buyer: true,
    },
  });

  if (negotiation && negotiation.listing.user.email) {
    const emailNotification = createNewOfferEmail(
      negotiation.listing.user.email,
      negotiation.listing.user.name || "Usuario",
      body.amount.toString(),
      body.currency ?? "USD",
      negotiation.listing.title,
      id
    );
    await sendEmail(emailNotification);
  }

  return jsonOk(toOfferDto(row), { status: 201 });
}
