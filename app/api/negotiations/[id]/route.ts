import { isApiMockMode } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api/http";
import { mockNegotiationById } from "@/lib/api/mock-data";
import type { NegotiationSummary } from "@/lib/api/contracts";

function toSummary(
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
    const found = mockNegotiationById[id];
    if (!found) return jsonError("Negotiation not found", 404);
    return jsonOk(found);
  }

  const db = getPrisma();
  if (!db) {
    const found = mockNegotiationById[id];
    if (!found) return jsonError("Negotiation not found", 404);
    return jsonOk(found);
  }

  const row = await db.negotiation.findUnique({
    where: { id },
    include: { thread: true },
  });
  if (!row) return jsonError("Negotiation not found", 404);
  return jsonOk(toSummary(row, row.thread?.id ?? null));
}
