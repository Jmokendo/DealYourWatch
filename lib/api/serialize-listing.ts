import type { Listing, Valuation } from "@prisma/client";
import type {
  ListingDetail,
  ListingSummary,
  ValuationDto,
} from "@/lib/api/contracts";

type ListingWithRelations = Listing & {
  images: { id: string; url: string; order: number }[];
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
  valuation?: Valuation | null;
};

function toValuationDto(v: Valuation): ValuationDto {
  return {
    id: v.id,
    listingId: v.listingId,
    chrono24Price: v.chrono24Price?.toString() ?? null,
    mlPrice: v.mlPrice?.toString() ?? null,
    localDelta: v.localDelta?.toString() ?? null,
    conditionDelta: v.conditionDelta?.toString() ?? null,
    boxPapersDelta: v.boxPapersDelta?.toString() ?? null,
    notes: v.notes,
    sources: Array.isArray(v.sources) ? (v.sources as unknown[]) : [],
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  };
}

export function toListingSummary(row: ListingWithRelations): ListingSummary {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price.toString(),
    currency: row.currency,
    condition: row.condition,
    hasBox: row.hasBox,
    hasPapers: row.hasPapers,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    images: row.images.map((i) => ({
      id: i.id,
      url: i.url,
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

export function toListingDetail(row: ListingWithRelations): ListingDetail {
  return {
    ...toListingSummary(row),
    valuation: row.valuation ? toValuationDto(row.valuation) : null,
  };
}
