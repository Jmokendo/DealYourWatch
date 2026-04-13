import type { PrismaClient } from "@prisma/client";
import { mockListings } from "@/lib/api/mock-data";

export function isNegotiationParticipant(
  userId: string,
  buyerId: string,
  sellerId: string,
): boolean {
  return userId === buyerId || userId === sellerId;
}

export async function loadNegotiationWithSeller(
  db: PrismaClient,
  negotiationId: string,
) {
  return db.negotiation.findUnique({
    where: { id: negotiationId },
    include: { listing: { select: { userId: true, status: true } } },
  });
}

export function mockListingSellerId(listingId: string): string | null {
  const listing = mockListings.find((l) => l.id === listingId);
  return listing?.user.id ?? null;
}
