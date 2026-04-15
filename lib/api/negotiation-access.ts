import type { PrismaClient } from "@prisma/client";
import {
  mockListings,
  mockNegotiationById,
  mockNegotiationsByListing,
} from "@/lib/api/mock-data";

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

export async function loadThreadWithNegotiationAccess(
  db: PrismaClient,
  threadId: string,
) {
  return db.thread.findUnique({
    where: { id: threadId },
    include: {
      negotiation: {
        include: { listing: { select: { userId: true } } },
      },
    },
  });
}

export function mockListingSellerId(listingId: string): string | null {
  const listing = mockListings.find((l) => l.id === listingId);
  return listing?.user.id ?? null;
}

export function mockNegotiationForThread(threadId: string) {
  const direct = Object.values(mockNegotiationById).find(
    (n) => n.threadId === threadId,
  );
  if (direct) return direct;

  return Object.values(mockNegotiationsByListing)
    .flat()
    .find((n) => n.threadId === threadId);
}
