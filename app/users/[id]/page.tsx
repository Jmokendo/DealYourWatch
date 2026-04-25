import { notFound } from "next/navigation";
import { UserProfilePage } from "@/components/users/UserProfilePage";
import type { UserProfileViewModel } from "@/components/users/types";
import { auth } from "@/lib/auth";
import { getPublicUserProfile } from "@/lib/api/users";

export default async function UserPublicProfileRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) {
    notFound();
  }

  const [session, profile] = await Promise.all([auth(), getPublicUserProfile(id)]);

  if (!profile) {
    notFound();
  }

  const model = toUserProfileViewModel({
    profile,
    viewerId: session?.user.id ?? null,
  });

  return <UserProfilePage profile={model} />;
}

function toUserProfileViewModel({
  profile,
  viewerId,
}: {
  profile: NonNullable<Awaited<ReturnType<typeof getPublicUserProfile>>>;
  viewerId: string | null;
}): UserProfileViewModel {
  const activeListings = profile.listings.filter((listing) => listing.status === "APPROVED");
  const soldListings = profile.listings.filter((listing) => listing.status === "SOLD");

  const fullName = profile.user.name?.trim() || profile.user.email;
  const memberSince = new Date(profile.user.createdAt).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  return {
    user: {
      id: profile.user.id,
      email: profile.user.email,
      name: fullName,
      initials: getInitials(fullName),
      image: profile.user.image,
      memberSinceLabel: `Miembro desde ${memberSince}`,
      locationLabel: "Ubicacion no disponible",
      verificationLabel: "Verificacion no disponible",
    },
    listings: profile.listings,
    activeListings,
    soldListings,
    stats: {
      totalListings: profile.listings.length,
      activeListings: activeListings.length,
      soldListings: soldListings.length,
      reviewCount: null,
      rating: null,
      responseRate: null,
    },
    isOwner: viewerId === profile.user.id,
    isAuthenticated: viewerId !== null,
  };
}

function getInitials(name: string) {
  const tokens = name
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    return "--";
  }

  return tokens
    .slice(0, 2)
    .map((token) => token[0])
    .join("")
    .toUpperCase();
}

