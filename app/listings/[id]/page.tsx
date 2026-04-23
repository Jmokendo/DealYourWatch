import { notFound } from "next/navigation";
import type { ListingDetail, NegotiationSummary } from "@/lib/api/contracts";
import { auth } from "@/lib/auth";
import { getListingDetailById } from "@/lib/api/listings";
import { getNegotiationsForListing } from "@/lib/api/negotiations";
import { ListingDetailPageView } from "@/components/listings/detail/ListingDetailPage";

type NegotiationState =
  | { status: "loaded"; negotiation?: NegotiationSummary }
  | { status: "error"; reason: string };

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  return (
    <ListingDetailPageView
      listing={listing}
      negotiationState={negotiationState}
      currentUserId={currentUserId}
    />
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
  if (!userId) {
    return { status: "loaded", negotiation: undefined };
  }

  try {
    const negotiations = await getNegotiationsForListing(listingId, userId);
    return { status: "loaded", negotiation: negotiations[0] };
  } catch {
    return {
      status: "error",
      reason: "No pudimos cargar el estado de negociacion para este listing.",
    };
  }
}
