import type { ListingSummary } from "@/lib/api/contracts";

export interface UserProfileStats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  reviewCount: number | null;
  rating: number | null;
  responseRate: number | null;
}

export interface UserProfileViewModel {
  user: {
    id: string;
    name: string;
    initials: string;
    email: string;
    image: string | null;
    memberSinceLabel: string;
    locationLabel: string;
    verificationLabel: string;
  };
  listings: ListingSummary[];
  activeListings: ListingSummary[];
  soldListings: ListingSummary[];
  stats: UserProfileStats;
  isOwner: boolean;
  isAuthenticated: boolean;
}

