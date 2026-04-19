import { isApiMockMode } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { mockListings, mockNegotiationsByListing } from "@/lib/api/mock-data";
import { isNegotiationParticipant } from "@/lib/api/negotiation-access";
import type { NegotiationSummary } from "@/lib/api/contracts";

export function toNegotiationSummary(
  n: {
    id: string;
    listingId: string;
    buyerId: string;
    status: string;
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
    status: n.status as NegotiationSummary["status"],
    round: n.round,
    expiresAt: n.expiresAt.toISOString(),
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  };
}

export async function getNegotiationsForListing(
  listingId: string,
  userId: string,
): Promise<NegotiationSummary[]> {
  if (isApiMockMode()) {
    const listing = mockListings.find((listing) => listing.id === listingId);
    if (!listing) return [];
    const list = (mockNegotiationsByListing[listingId] ?? []).filter((n) =>
      isNegotiationParticipant(userId, n.buyerId, listing.user.id),
    );
    return list.map((n) => ({ ...n }));
  }

  const db = getPrisma();
  if (!db) return [];

  const listing = await db.listing.findUnique({ where: { id: listingId } });
  if (!listing) return [];

  const rows = await db.negotiation.findMany({
    where: {
      listingId,
      OR: [{ buyerId: userId }, { listing: { userId: userId } }],
    },
    orderBy: { createdAt: "desc" },
    include: { thread: true },
  });

  return rows.map((row) => toNegotiationSummary(row, row.thread?.id ?? null));
}
