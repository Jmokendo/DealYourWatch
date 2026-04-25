import type { ListingStatus, ListingSummary } from "@/lib/api/contracts";
import { LISTING_INCLUDE } from "@/lib/api/listings";
import { toListingSummary } from "@/lib/api/serialize-listing";
import { mockListings } from "@/lib/api/mock-data";
import { isApiMockMode } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";

const PUBLIC_LISTING_STATUSES: ListingStatus[] = ["APPROVED", "SOLD"];

export interface PublicUserProfile {
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    createdAt: string;
  };
  listings: ListingSummary[];
}

export async function getPublicUserProfile(
  userId: string,
): Promise<PublicUserProfile | null> {
  if (!userId) return null;

  if (isApiMockMode()) {
    return getMockPublicUserProfile(userId);
  }

  try {
    const db = getPrisma();
    const row = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
        listings: {
          where: { status: { in: PUBLIC_LISTING_STATUSES } },
          orderBy: { createdAt: "desc" },
          include: LISTING_INCLUDE,
        },
      },
    });

    if (!row) return null;

    return {
      user: {
        id: row.id,
        email: row.email,
        name: row.name,
        image: row.image,
        createdAt: row.createdAt.toISOString(),
      },
      listings: row.listings.map((listing) => toListingSummary(listing)),
    };
  } catch {
    return getMockPublicUserProfile(userId);
  }
}

function getMockPublicUserProfile(userId: string): PublicUserProfile | null {
  const listings = mockListings.filter(
    (listing) =>
      listing.user.id === userId &&
      (listing.status === "APPROVED" || listing.status === "SOLD"),
  );

  const firstListing = listings[0];
  if (!firstListing) return null;

  return {
    user: {
      id: firstListing.user.id,
      email: firstListing.user.email,
      name: firstListing.user.name,
      image: firstListing.user.image,
      createdAt: firstListing.createdAt,
    },
    listings,
  };
}

