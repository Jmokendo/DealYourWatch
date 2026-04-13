import { isApiMockMode } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api/http";
import type { CreateOfferBody, OfferDto } from "@/lib/api/contracts";
import {
  mockNegotiationById,
  mockOffersByNegotiation,
} from "@/lib/api/mock-data";

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

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  if (isApiMockMode()) {
    if (!mockNegotiationById[id]) return jsonError("Negotiation not found", 404);
    return jsonOk([...(mockOffersByNegotiation[id] ?? [])]);
  }

  const db = getPrisma();
  if (!db) return jsonOk([]);

  const neg = await db.negotiation.findUnique({ where: { id } });
  if (!neg) return jsonError("Negotiation not found", 404);

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
  const { id } = await ctx.params;
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }
  const o = raw as Record<string, unknown>;
  const userEmail =
    typeof o.userEmail === "string" ? o.userEmail.trim() : "";
  const reasonType =
    typeof o.reasonType === "string" ? o.reasonType.trim() : "";
  const amount =
    typeof o.amount === "number" ? o.amount : Number.parseFloat(String(o.amount));

  if (!userEmail) return jsonError("userEmail is required", 400);
  if (!reasonType) return jsonError("reasonType is required", 400);
  if (!Number.isFinite(amount) || amount <= 0) {
    return jsonError("amount must be a positive number", 400);
  }

  const body: CreateOfferBody = {
    userEmail,
    amount,
    reasonType,
    reasonNote: typeof o.reasonNote === "string" ? o.reasonNote : undefined,
    currency: typeof o.currency === "string" ? o.currency : undefined,
  };

  if (isApiMockMode()) {
    if (!mockNegotiationById[id]) return jsonError("Negotiation not found", 404);
    const now = new Date().toISOString();
    const offer: OfferDto = {
      id: `mock-offer-${Date.now()}`,
      negotiationId: id,
      userId: `mock-user-${userEmail}`,
      amount: amount.toFixed(2),
      currency: body.currency ?? "USD",
      reasonType: body.reasonType,
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

  const neg = await db.negotiation.findUnique({ where: { id } });
  if (!neg) return jsonError("Negotiation not found", 404);

  const user = await db.user.upsert({
    where: { email: userEmail },
    create: { email: userEmail },
    update: {},
  });

  const row = await db.offer.create({
    data: {
      negotiationId: id,
      userId: user.id,
      amount: body.amount,
      currency: body.currency ?? "USD",
      reasonType: body.reasonType,
      reasonNote: body.reasonNote,
    },
  });

  return jsonOk(toOfferDto(row), { status: 201 });
}
