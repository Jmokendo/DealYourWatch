export const runtime = "nodejs";

import { isApiMockMode } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api/http";
import type { CreateNegotiationBody, NegotiationStatus, NegotiationSummary } from "@/lib/api/contracts";
import { auth } from "@/lib/auth";
import {
  mockListings,
  mockNegotiationById,
  mockNegotiationsByListing,
} from "@/lib/api/mock-data";
import { getNegotiationsForListing, toNegotiationSummary } from "@/lib/api/negotiations";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) return jsonError("Unauthorized", 401);
  const { id } = await ctx.params;
  return jsonOk(await getNegotiationsForListing(id, session.user.id));
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
  const body: CreateNegotiationBody = {
    buyerName: typeof o.buyerName === "string" ? o.buyerName : undefined,
    expiresInDays:
      typeof o.expiresInDays === "number" ? o.expiresInDays : undefined,
  };

  if (isApiMockMode()) {
    const foundListing = mockListings.find((l) => l.id === id);
    if (!foundListing) return jsonError("Listing not found", 404);
    if (foundListing.status === "SOLD") {
      return jsonError("Listing is sold", 409);
    }
    if (foundListing.user.id === userId) {
      return jsonError("Cannot negotiate your own listing", 403);
    }
    const days = body.expiresInDays ?? 7;
    const expiresAt = new Date(Date.now() + days * 864e5).toISOString();
    const now = new Date().toISOString();
    const negId = `mock-neg-${Date.now()}`;
    const neg: NegotiationSummary = {
      id: negId,
      listingId: id,
      buyerId: userId,
      threadId: `mock-thread-${negId}`,
      status: "ACTIVE",
      round: 1,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    };
    if (!mockNegotiationsByListing[id]) mockNegotiationsByListing[id] = [];
    mockNegotiationsByListing[id].push(neg);
    mockNegotiationById[neg.id] = neg;
    return jsonOk(neg, { status: 201 });
  }

  const db = getPrisma();
  if (!db) return jsonError("Database not configured", 503);

  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) return jsonError("Listing not found", 404);
  if (listing.status === "SOLD") {
    return jsonError("Listing is sold", 409);
  }
  if (listing.userId === userId) {
    return jsonError("Cannot negotiate your own listing", 403);
  }

  if (body.buyerName) {
    await db.user.update({
      where: { id: userId },
      data: { name: body.buyerName },
    });
  }

  const days = body.expiresInDays ?? 7;
  const expiresAt = new Date(Date.now() + days * 864e5);

  const neg = await db.negotiation.create({
    data: {
      listingId: id,
      buyerId: userId,
      expiresAt,
    },
  });

  await db.thread.create({
    data: {
      negotiationId: neg.id,
      buyerId: userId,
    },
  });

  const full = await db.negotiation.findUniqueOrThrow({
    where: { id: neg.id },
    include: { thread: true },
  });
  return jsonOk(
    toNegotiationSummary(
      { ...full, status: full.status as NegotiationStatus },
      full.thread?.id ?? null,
    ),
    { status: 201 },
  );
}
