import { isApiMockMode } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api/http";
import { mockListings } from "@/lib/api/mock-data";
import { parseCreateListingBody } from "@/lib/api/validate";
import { toListingSummary } from "@/lib/api/serialize-listing";
import { LISTING_INCLUDE } from "@/lib/api/listings";
import type { ListingStatus, ListingSummary } from "@/lib/api/contracts";
import { auth } from "@/lib/auth";
import {
  createListing,
  getUserListings,
  normalizeCreateListingImages,
} from "@/lib/services/listing-service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as ListingStatus | null;
  const brand = searchParams.get("brand");
  const q = searchParams.get("q");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const ownerIdParam = searchParams.get("ownerId");

  let resolvedOwnerId: string | null = null;
  if (ownerIdParam) {
    if (ownerIdParam === "me") {
      const session = await auth();
      if (!session) return jsonError("Unauthorized", 401);
      resolvedOwnerId = session.user.id;
    } else {
      resolvedOwnerId = ownerIdParam;
    }
  }

  // Dedicated "my listings" path — delegates to service
  if (ownerIdParam === "me" && resolvedOwnerId) {
    if (isApiMockMode()) {
      return jsonOk(mockListings.filter((l) => l.user.id === resolvedOwnerId));
    }
    const db = getPrisma();
    if (!db) return jsonOk([]);
    const result = await getUserListings(db, resolvedOwnerId);
    if (!result.ok) return jsonError(result.error, result.status);
    return jsonOk(result.data);
  }

  if (isApiMockMode()) {
    let data: ListingSummary[] = [...mockListings];
    if (status) data = data.filter((l) => l.status === status);
    if (resolvedOwnerId) data = data.filter((l) => l.user.id === resolvedOwnerId);
    if (brand) data = data.filter((l) => l.model.brand.name.toLowerCase().includes(brand.toLowerCase()));
    if (q) data = data.filter((l) =>
      l.title.toLowerCase().includes(q.toLowerCase()) ||
      l.model.name.toLowerCase().includes(q.toLowerCase()) ||
      l.model.brand.name.toLowerCase().includes(q.toLowerCase())
    );
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) data = data.filter((l) => parseFloat(l.price) >= min);
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) data = data.filter((l) => parseFloat(l.price) <= max);
    }
    return jsonOk(data);
  }

  try {
    const db = getPrisma();
    if (!db) return jsonOk([...mockListings]);

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (resolvedOwnerId) where.userId = resolvedOwnerId;
    if (brand) where.model = { brand: { name: { contains: brand, mode: "insensitive" } } };
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { model: { name: { contains: q, mode: "insensitive" } } },
        { model: { brand: { name: { contains: q, mode: "insensitive" } } } },
      ];
    }
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) where.price = { ...(where.price as object), gte: min };
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) where.price = { ...(where.price as object), lte: max };
    }

    const rows = await db.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: LISTING_INCLUDE,
    });

    return jsonOk(rows.map((r) => toListingSummary(r)));
  } catch (error) {
    console.error("Get listings error:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return jsonError("Unauthorized", 401);
  const userId = session.user.id;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = parseCreateListingBody(raw);
  if (!parsed.ok) return jsonError(parsed.error, 400);

  const b = parsed.body;
  const images = normalizeCreateListingImages(b);

  if (isApiMockMode()) {
    const now = new Date().toISOString();
    const created: ListingSummary = {
      id: `mock-${Date.now()}`,
      title: b.title,
      description: b.description ?? null,
      price: b.price.toFixed(2),
      currency: b.currency ?? "USD",
      condition: b.condition ?? "EXCELLENT",
      hasBox: b.hasBox ?? false,
      hasPapers: b.hasPapers ?? false,
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
      images: images.map((image, index) => ({
        id: `img-${Date.now()}-${index}`,
        url: image.url,
        publicId: image.publicId ?? null,
        order: index,
      })),
      model: {
        id: "mock-model-fallback",
        name: "Unspecified",
        slug: "unspecified",
        reference: null,
        brand: { id: "mock-brand-other", name: "Other", slug: "other" },
      },
      user: { id: userId, email: "dev@test.com", name: b.userName ?? "Dev User", image: null },
    };
    mockListings.unshift(created);
    return jsonOk(created, { status: 201 });
  }

  const db = getPrisma();
  if (!db) return jsonError("Database not configured", 503);

  const result = await createListing(db, userId, b);
  if (!result.ok) return jsonError(result.error, result.status);

  console.log("Created listing:", result.data.id);
  return jsonOk({ id: result.data.id }, { status: 201 });
}
