import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api/http";
import { isApiMockMode } from "@/lib/env";
import { mockNegotiationsByListing, mockListings } from "@/lib/api/mock-data";
import type { UserNegotiation } from "@/lib/api/contracts";
import { getUserNegotiations } from "@/lib/services/negotiation-service";

export async function GET() {
  const session = await auth();
  if (!session) return jsonError("Unauthorized", 401);
  const userId = session.user.id;

  if (isApiMockMode()) {
    const results: UserNegotiation[] = [];
    for (const [listingId, negs] of Object.entries(mockNegotiationsByListing)) {
      const listing = mockListings.find((l) => l.id === listingId);
      for (const neg of negs) {
        if (neg.buyerId === userId) {
          results.push({
            id: neg.id,
            listingId,
            listingTitle: listing?.title ?? "Unknown listing",
            status: neg.status,
            round: neg.round,
            expiresAt: neg.expiresAt,
            createdAt: neg.createdAt,
            updatedAt: neg.updatedAt,
            threadId: neg.threadId,
          });
        }
      }
    }
    return jsonOk(results);
  }

  const db = getPrisma();
  if (!db) return jsonOk([]);

  const result = await getUserNegotiations(db, userId);
  if (!result.ok) return jsonError(result.error, result.status);
  return jsonOk(result.data);
}
