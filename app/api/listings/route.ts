import { getPrisma } from "@/lib/prisma";
import { ok, created, badRequest, notFound, serverError, requireFields } from "@/lib/api";
import { Condition, ListingStatus, Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_CONDITIONS: Condition[] = ["NEW", "MINT", "EXCELLENT", "GOOD", "FAIR"];
const VALID_STATUSES: ListingStatus[] = ["ACTIVE", "PAUSED", "SOLD", "DELETED", "PENDING", "APPROVED"];
const VALID_SORT_BY = ["createdAt", "price", "updatedAt"] as const;
type SortBy = (typeof VALID_SORT_BY)[number];

/** Serialize a listing row (with relations) to a slim summary shape. */
function toSummary(row: ListingWithRelations, bestOfferMap: Map<string, string>) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price.toString(),
    currency: row.currency,
    condition: row.condition,
    year: row.year,
    hasBox: row.hasBox,
    hasPapers: row.hasPapers,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    brand: {
      id: row.model.brand.id,
      name: row.model.brand.name,
      slug: row.model.brand.slug,
    },
    seller: {
      id: row.user.id,
      name: row.user.name,
    },
    firstImage: row.images[0]?.url ?? null,
    bestOffer: bestOfferMap.get(row.id) ?? null,
  };
}

type ListingWithRelations = Prisma.ListingGetPayload<{
  include: {
    model: { include: { brand: true } };
    user: { select: { id: true; name: true } };
    images: { orderBy: { order: "asc" }; take: 1 };
  };
}>;

// ---------------------------------------------------------------------------
// GET /api/listings
// ---------------------------------------------------------------------------
export async function GET(req: Request) {
  const db = getPrisma();
  if (!db) return serverError("Database not configured");

  const { searchParams } = new URL(req.url);

  // Pagination
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20));
  const skip = (page - 1) * limit;

  // Filters
  const statusParam = searchParams.get("status") as ListingStatus | null;
  const brandParam = searchParams.get("brand");
  const conditionParam = searchParams.get("condition") as Condition | null;
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  // Sorting
  const sortByParam = searchParams.get("sortBy") ?? "createdAt";
  const sortBy: SortBy = VALID_SORT_BY.includes(sortByParam as SortBy)
    ? (sortByParam as SortBy)
    : "createdAt";
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";

  const where: Prisma.ListingWhereInput = {};

  if (statusParam && VALID_STATUSES.includes(statusParam)) {
    where.status = statusParam;
  }
  if (conditionParam && VALID_CONDITIONS.includes(conditionParam)) {
    where.condition = conditionParam;
  }
  if (brandParam) {
    where.model = { brand: { OR: [{ slug: brandParam }, { name: brandParam }] } };
  }
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = new Prisma.Decimal(minPrice);
    if (maxPrice) where.price.lte = new Prisma.Decimal(maxPrice);
  }

  try {
    const [rows, total] = await Promise.all([
      db.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: {
          model: { include: { brand: true } },
          user: { select: { id: true, name: true } },
          images: { orderBy: { order: "asc" }, take: 1 },
        },
      }),
      db.listing.count({ where }),
    ]);

    // Compute best offer per listing in one query
    const listingIds = rows.map((r) => r.id);
    const bestOfferMap = new Map<string, string>();

    if (listingIds.length > 0) {
      const bestOffers = await db.$queryRaw<{ listing_id: string; best: string }[]>`
        SELECT n."listingId" AS listing_id, MAX(o.amount)::text AS best
        FROM "offers" o
        JOIN "negotiations" n ON o."negotiationId" = n.id
        WHERE n."listingId" = ANY(${listingIds}::text[])
          AND o.status NOT IN ('REJECTED', 'WITHDRAWN')
        GROUP BY n."listingId"
      `;
      for (const row of bestOffers) {
        bestOfferMap.set(row.listing_id, row.best);
      }
    }

    return ok({
      listings: rows.map((r) => toSummary(r, bestOfferMap)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (e) {
    return serverError(e);
  }
}

// ---------------------------------------------------------------------------
// POST /api/listings
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  const db = getPrisma();
  if (!db) return serverError("Database not configured");

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return badRequest("JSON inválido");
  }

  const body = raw as Record<string, unknown>;

  // TODO: replace with session.user.id
  const missingField = requireFields(body, ["title", "price", "condition", "brandId", "sellerId"]);
  if (missingField) return badRequest(missingField);

  const title = String(body.title).trim();
  const description = typeof body.description === "string" ? body.description.trim() : null;
  const price = Number(body.price);
  const currency = typeof body.currency === "string" ? body.currency.toUpperCase() : "USD";
  const condition = body.condition as Condition;
  const brandId = String(body.brandId);
  const sellerId = String(body.sellerId); // TODO: replace with session.user.id
  const modelId = typeof body.modelId === "string" ? body.modelId : null;
  const year = typeof body.year === "number" ? body.year : null;
  const imageUrls: string[] = Array.isArray(body.imageUrls)
    ? body.imageUrls.filter((u): u is string => typeof u === "string")
    : [];

  if (!Number.isFinite(price) || price <= 0) {
    return badRequest("El precio debe ser un número positivo");
  }
  if (!VALID_CONDITIONS.includes(condition)) {
    return badRequest(`Condición inválida. Valores válidos: ${VALID_CONDITIONS.join(", ")}`);
  }

  try {
    // Validate seller
    const seller = await db.user.findUnique({ where: { id: sellerId } });
    if (!seller) return badRequest("El vendedor indicado no existe");

    // Validate brand
    const brand = await db.brand.findUnique({ where: { id: brandId } });
    if (!brand) return badRequest("La marca indicada no existe");

    // Resolve model
    let resolvedModelId: string;
    if (modelId) {
      const model = await db.watchModel.findFirst({
        where: { id: modelId, brandId },
      });
      if (!model) return badRequest("El modelo indicado no existe o no pertenece a la marca");
      resolvedModelId = model.id;
    } else {
      // Find or create a fallback "Other" model for this brand
      const fallbackSlug = "other";
      const existing = await db.watchModel.findUnique({
        where: { brandId_slug: { brandId, slug: fallbackSlug } },
      });
      if (existing) {
        resolvedModelId = existing.id;
      } else {
        const created_ = await db.watchModel.create({
          data: { brandId, name: "Other", slug: fallbackSlug },
        });
        resolvedModelId = created_.id;
      }
    }

    const listing = await db.listing.create({
      data: {
        userId: sellerId,
        modelId: resolvedModelId,
        title,
        description,
        price,
        currency,
        condition,
        year,
        status: "ACTIVE",
        images: imageUrls.length
          ? { create: imageUrls.map((url, order) => ({ url, order })) }
          : undefined,
      },
      include: {
        model: { include: { brand: true } },
        user: { select: { id: true, name: true } },
        images: { orderBy: { order: "asc" } },
      },
    });

    return created({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: listing.price.toString(),
      currency: listing.currency,
      condition: listing.condition,
      year: listing.year,
      hasBox: listing.hasBox,
      hasPapers: listing.hasPapers,
      status: listing.status,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
      brand: {
        id: listing.model.brand.id,
        name: listing.model.brand.name,
        slug: listing.model.brand.slug,
      },
      model: {
        id: listing.model.id,
        name: listing.model.name,
        slug: listing.model.slug,
        reference: listing.model.reference,
      },
      seller: { id: listing.user.id, name: listing.user.name },
      images: listing.images.map((img) => ({ id: img.id, url: img.url, order: img.order })),
    });
  } catch (e) {
    return serverError(e);
  }
}
