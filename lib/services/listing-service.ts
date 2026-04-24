import type { PrismaClient } from "@prisma/client";
import type {
  CreateListingBody,
  CreateListingImageInput,
  ListingSummary,
} from "@/lib/api/contracts";
import { toListingSummary } from "@/lib/api/serialize-listing";
import { LISTING_INCLUDE } from "@/lib/api/listings";
import { ensureFallbackWatchModelId } from "@/lib/api/catalog";
import { normalizeListingImageUrl } from "@/lib/listing-images";
import { serviceFail, serviceOk, type ServiceResult } from "@/lib/services/types";

function normalizePublicId(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeCreateListingImages(
  body: CreateListingBody,
): CreateListingImageInput[] {
  const images = new Map<string, CreateListingImageInput>();

  for (const image of body.images ?? []) {
    const url = normalizeListingImageUrl(image.url);
    if (!url) continue;

    const publicId = normalizePublicId(image.publicId);
    const existing = images.get(url);

    images.set(url, {
      url,
      publicId: existing?.publicId ?? publicId ?? null,
    });
  }

  for (const urlValue of body.imageUrls ?? []) {
    const url = normalizeListingImageUrl(urlValue);
    if (!url || images.has(url)) continue;
    images.set(url, { url, publicId: null });
  }

  if (body.imageUrl) {
    const url = normalizeListingImageUrl(body.imageUrl);
    if (url && !images.has(url)) {
      images.set(url, { url, publicId: null });
    }
  }

  return [...images.values()];
}

export async function createListing(
  db: PrismaClient,
  userId: string,
  body: CreateListingBody,
): Promise<ServiceResult<ListingSummary>> {
  const images = normalizeCreateListingImages(body);

  const modelId = body.modelId ?? (await ensureFallbackWatchModelId(db));

  if (body.modelId) {
    const exists = await db.watchModel.findUnique({ where: { id: body.modelId } });
    if (!exists) return serviceFail("modelId not found", 400);
  }

  if (body.userName) {
    await db.user.update({ where: { id: userId }, data: { name: body.userName } });
  }

  const listing = await db.listing.create({
    data: {
      userId,
      modelId,
      title: body.title,
      description: body.description,
      price: body.price,
      currency: body.currency ?? "USD",
      condition: body.condition ?? "EXCELLENT",
      hasBox: body.hasBox ?? false,
      hasPapers: body.hasPapers ?? false,
      status: "PENDING",
      images:
        images.length > 0
          ? {
              create: images.map((image, index) => ({
                publicId: image.publicId ?? null,
                url: image.url,
                order: index,
              })),
            }
          : undefined,
    },
    include: LISTING_INCLUDE,
  });

  return serviceOk(toListingSummary(listing));
}

export async function getUserListings(
  db: PrismaClient,
  userId: string,
): Promise<ServiceResult<ListingSummary[]>> {
  const rows = await db.listing.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: LISTING_INCLUDE,
  });
  return serviceOk(rows.map(toListingSummary));
}
