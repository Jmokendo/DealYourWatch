import type { Listing } from "@prisma/client";
import type { ListingSummary } from "@/lib/api/contracts";

type ListingWithRelations = Listing & {
  images: { id: string; url: string; publicId: string | null; order: number }[];
  model: {
    id: string;
    name: string;
    slug: string;
    reference: string | null;
    brand: { id: string; name: string; slug: string };
  };
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  };
};

export function toListingSummary(row: ListingWithRelations): ListingSummary {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price.toString(),
    currency: row.currency,
    condition: row.condition as ListingSummary["condition"],
    hasBox: row.hasBox,
    hasPapers: row.hasPapers,
    status: row.status as ListingSummary["status"],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    images: row.images.map((i) => ({
      id: i.id,
      url: i.url,
      publicId: i.publicId,
      order: i.order,
    })),
    model: {
      id: row.model.id,
      name: row.model.name,
      slug: row.model.slug,
      reference: row.model.reference,
      brand: { ...row.model.brand },
    },
    user: { ...row.user },
  };
}

export const toListingDetail = toListingSummary;
