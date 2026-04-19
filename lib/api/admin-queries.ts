import type { ListingStatus } from "@/lib/api/contracts";

export function toAdminListing(l: {
  id: string;
  title: string;
  price: { toString(): string };
  currency: string;
  status: string;
  createdAt: Date;
  user: { id: string; email: string; name: string | null };
}) {
  return {
    id: l.id,
    title: l.title,
    price: l.price.toString(),
    currency: l.currency,
    status: l.status as ListingStatus,
    owner: l.user,
    createdAt: l.createdAt.toISOString(),
  };
}
