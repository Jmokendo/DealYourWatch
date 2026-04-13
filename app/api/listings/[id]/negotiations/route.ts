import { isApiMockMode } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api/http";
import type {
  CreateNegotiationBody,
  NegotiationSummary,
} from "@/lib/api/contracts";
import {
  mockListings,
  mockNegotiationById,
  mockNegotiationsByListing,
} from "@/lib/api/mock-data";

function toNegotiationSummary(
  n: {
    id: string;
    listingId: string;
    buyerId: string;
    status: NegotiationSummary["status"];
    round: number;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
  },
  threadId: string | null,
): NegotiationSummary {
  return {
    id: n.id,
    listingId: n.listingId,
    buyerId: n.buyerId,
    threadId,
    status: n.status,
    round: n.round,
    expiresAt: n.expiresAt.toISOString(),
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  };
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  if (isApiMockMode()) {
    if (!mockListings.some((l) => l.id === id)) {
      return jsonError("Listing not found", 404);
    }
    const list = mockNegotiationsByListing[id] ?? [];
    return jsonOk(list.map((n) => ({ ...n })));
  }

  const db = getPrisma();
  if (!db) return jsonOk([]);

  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) return jsonError("Listing not found", 404);

  const rows = await db.negotiation.findMany({
    where: { listingId: id },
    orderBy: { createdAt: "desc" },
    include: { thread: true },
  });
  return jsonOk(
    rows.map((r) => toNegotiationSummary(r, r.thread?.id ?? null)),
  );
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }
  const o = raw as Record<string, unknown>;
  const buyerEmail =
    typeof o.buyerEmail === "string" ? o.buyerEmail.trim() : "";
  if (!buyerEmail) return jsonError("buyerEmail is required", 400);
  const body: CreateNegotiationBody = {
    buyerEmail,
    buyerName: typeof o.buyerName === "string" ? o.buyerName : undefined,
    expiresInDays:
      typeof o.expiresInDays === "number" ? o.expiresInDays : undefined,
  };

  if (isApiMockMode()) {
    if (!mockListings.some((l) => l.id === id)) {
      return jsonError("Listing not found", 404);
    }
    const days = body.expiresInDays ?? 7;
    const expiresAt = new Date(Date.now() + days * 864e5).toISOString();
    const now = new Date().toISOString();
    const negId = `mock-neg-${Date.now()}`;
    const neg: NegotiationSummary = {
      id: negId,
      listingId: id,
      buyerId: `mock-buyer-${buyerEmail}`,
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

  const buyer = await db.user.upsert({
    where: { email: buyerEmail },
    create: { email: buyerEmail, name: body.buyerName ?? null },
    update: { name: body.buyerName ?? undefined },
  });

  const days = body.expiresInDays ?? 7;
  const expiresAt = new Date(Date.now() + days * 864e5);

  const neg = await db.negotiation.create({
    data: {
      listingId: id,
      buyerId: buyer.id,
      expiresAt,
    },
  });

  await db.thread.create({
    data: {
      negotiationId: neg.id,
      buyerId: buyer.id,
    },
  });

  const full = await db.negotiation.findUniqueOrThrow({
    where: { id: neg.id },
    include: { thread: true },
  });
  return jsonOk(
    toNegotiationSummary(full, full.thread?.id ?? null),
    { status: 201 },
  );
}
