import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { ListingDetail, NegotiationSummary } from "@/lib/api/contracts";
import { auth } from "@/lib/auth";
import { getListingDetailById } from "@/lib/api/listings";
import { getNegotiationsForListing } from "@/lib/api/negotiations";
import { formatMoney } from "@/lib/marketplace-ui";
import ListingGallery from "@/components/listing/ListingGallery";
import ListingDetails from "@/components/listing/ListingDetails";
import ListingActions from "@/components/listing/ListingActions";
import SellerCard from "@/components/listing/SellerCard";

type NegotiationState =
  | { status: "loaded"; negotiation?: NegotiationSummary }
  | { status: "error"; reason: string };

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
  if (!id) {
    notFound();
  }

  const session = await auth();
  const currentUserId = session?.user.id ?? null;
  const isAdmin =
    session?.user.role === "ADMIN" || session?.user.role === "SUPER_ADMIN";

  const [listing, negotiationState] = await Promise.all([
    loadListingDetail(id, currentUserId, isAdmin),
    loadNegotiationState(id, currentUserId),
  ]);

  if (!listing) {
    notFound();
  }
  const isOwner = currentUserId !== null && currentUserId === listing.user.id;
  const isAuthenticated = currentUserId !== null;
  const priceLabel = formatMoney(listing.price, listing.currency);
  const offersCount = (listing as any).offersCount;
  const bestOffer = (listing as any).bestOffer;
  const bestOfferPercent = (listing as any).bestOfferPercent;
  const watchers = (listing as any).watchers;

  return (
    <main className="bg-[#F9FAFB] px-6 py-16">
      <div className="mx-auto min-h-full max-w-7xl flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-600">
          <Button type="button" variant="ghost" asChild>
            <Link href="/listings">← Back to listings</Link>
          </Button>
          <span className="text-zinc-400">/</span>
          <span className="font-medium">Product detail</span>
        </div>

        <section className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_420px]">
          <ListingGallery listing={listing} />
          <div className="space-y-6">
            <ListingDetails listing={listing} />
            <ListingActions
              listingId={listing.id}
              negotiationState={negotiationState}
              isOwner={isOwner}
              isAuthenticated={isAuthenticated}
              priceLabel={priceLabel}
              offersCount={offersCount}
              bestOffer={bestOffer}
              bestOfferPercent={bestOfferPercent}
              watchers={watchers}
            />
            <SellerCard user={listing.user} />
          </div>
        </section>
      </div>
    </main>
  );
}

async function loadListingDetail(
  id: string,
  currentUserId: string | null,
  isAdmin: boolean,
): Promise<ListingDetail | null> {
  const listing = await getListingDetailById(id);
  if (!listing) return null;

  const isOwner = currentUserId !== null && currentUserId === listing.user.id;
  const canViewPublic = listing.status === "APPROVED";

  if (!canViewPublic && !isOwner && !isAdmin) {
    return null;
  }

  return listing;
}

async function loadNegotiationState(
  listingId: string,
  userId: string | null,
): Promise<NegotiationState> {
  // Guests don't have negotiations yet
  if (!userId) {
    return { status: "loaded", negotiation: undefined };
  }

  try {
    const negotiations = await getNegotiationsForListing(listingId, userId);
    return { status: "loaded", negotiation: negotiations[0] };
  } catch {
    return {
      status: "error",
      reason: "We couldn't load the negotiation state for this listing.",
    };
  }
}
