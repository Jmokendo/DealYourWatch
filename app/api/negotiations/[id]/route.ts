export const runtime = "nodejs";

import { isApiMockMode } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api/http";
import { mockNegotiationById } from "@/lib/api/mock-data";
import {
  isNegotiationParticipant,
  mockListingSellerId,
} from "@/lib/api/negotiation-access";
import { toNegotiationSummary } from "@/lib/api/negotiations";
import { auth } from "@/lib/auth";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) return jsonError("Unauthorized", 401);
  const userId = session.user.id;

  const { id } = await ctx.params;

  if (isApiMockMode()) {
    const found = mockNegotiationById[id];
    if (!found) return jsonError("Negotiation not found", 404);
    const sellerId = mockListingSellerId(found.listingId);
    if (!sellerId) return jsonError("Listing not found", 404);
    if (!isNegotiationParticipant(userId, found.buyerId, sellerId)) {
      return jsonError("Forbidden", 403);
    }
    return jsonOk(found);
  }

  try {
    const db = getPrisma();
    if (!db) return jsonError("Database not configured", 503);

    const row = await db.negotiation.findUnique({
      where: { id },
      include: { thread: true, listing: { select: { userId: true } } },
    });
    if (!row) return jsonError("Negotiation not found", 404);
    if (
      !isNegotiationParticipant(userId, row.buyerId, row.listing.userId)
    ) {
      return jsonError("Forbidden", 403);
    }
    return jsonOk(toNegotiationSummary(row, row.thread?.id ?? null));
  } catch (error) {
    console.error("Get negotiation error:", error);
    return jsonError("Internal server error", 500);
  }
}
