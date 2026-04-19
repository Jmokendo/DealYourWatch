import { isApiMockMode } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { mockListings } from "@/lib/api/mock-data";
import { toListingSummary } from "@/lib/api/serialize-listing";
import type { ListingDetail } from "@/lib/api/contracts";

export const LISTING_INCLUDE = {
  images: { orderBy: { order: "asc" as const } },
  model: { include: { brand: true } },
  user: true,
} as const;

export async function getListingDetailById(id: string): Promise<ListingDetail | null> {
  if (isApiMockMode()) {
    const found = mockListings.find((listing) => listing.id === id);
    return found ?? null;
  }

  const db = getPrisma();
  if (!db) {
    return mockListings.find((listing) => listing.id === id) ?? null;
  }

  const row = await db.listing.findUnique({
    where: { id },
    include: LISTING_INCLUDE,
  });
  if (!row) return null;
  return toListingSummary(row);
}
