import type { ListingDetail, NegotiationSummary } from "@/lib/api/contracts";
import { ListingsFeedHeader } from "@/components/listings/ListingsFeedHeader";
import { ListingGallery } from "@/components/listings/detail/ListingGallery";
import { ListingInfo } from "@/components/listings/detail/ListingInfo";
import { ListingPricePanel } from "@/components/listings/detail/ListingPricePanel";
import { ListingSpecs } from "@/components/listings/detail/ListingSpecs";
import { ListingSellerCard } from "@/components/listings/detail/ListingSellerCard";

type NegotiationState =
  | { status: "loaded"; negotiation?: NegotiationSummary }
  | { status: "error"; reason: string };

interface ListingDetailPageViewProps {
  listing: ListingDetail;
  negotiationState: NegotiationState;
  currentUserId: string | null;
}

export function ListingDetailPageView({
  listing,
  negotiationState,
  currentUserId,
}: ListingDetailPageViewProps) {
  const isOwner = currentUserId !== null && currentUserId === listing.user.id;
  const isAuthenticated = currentUserId !== null;

  return (
    <main className="min-h-screen bg-[#f6f5f2] text-[#1d1d21]">
      <ListingsFeedHeader />

      <section className="px-5 py-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1380px]">
          <div className="text-sm text-[#a19c94]">
            Relojes / {listing.model.brand.name} / {listing.model.name}
          </div>

          <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_640px]">
            <div>
              <ListingGallery listing={listing} />
            </div>

            <div className="space-y-6">
              <ListingInfo listing={listing} />
              <ListingPricePanel
                listing={listing}
                negotiationState={negotiationState}
                isOwner={isOwner}
                isAuthenticated={isAuthenticated}
              />
              <ListingSpecs listing={listing} />
              <ListingSellerCard user={listing.user} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
