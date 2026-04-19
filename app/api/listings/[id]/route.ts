export const runtime = "nodejs";

import { getPrisma } from "@/lib/prisma";
import { ok, badRequest, notFound, serverError } from "@/lib/api";
import { Condition, Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_CONDITIONS: Condition[] = ["NEW", "MINT", "EXCELLENT", "GOOD", "FAIR"];

function toDetail(
  row: Prisma.ListingGetPayload<{
    include: {
      model: { include: { brand: true } };
      user: { select: { id: true; name: true; email: true } };
      images: { orderBy: { order: "asc" } };
      negotiations: {
        select: {
          id: true;
          status: true;
          offers: { select: { amount: true; status: true }; orderBy: { amount: "desc" }; take: 1 };
        };
      };
    };
  }>,
) {
  const activeNegotiations = row.negotiations.filter(
    (n) => n.status === "ACTIVE",
  ).length;

  const bestOffer = row.negotiations
    .flatMap((n) => n.offers)
    .filter((o) => o.status !== "REJECTED" && o.status !== "WITHDRAWN")
    .reduce<string | null>((best, o) => {
      const amt = o.amount.toString();
      if (best === null) return amt;
      return parseFloat(amt) > parseFloat(best) ? amt : best;
    }, null);

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
    soldAt: row.soldAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    brand: {
      id: row.model.brand.id,
      name: row.model.brand.name,
      slug: row.model.brand.slug,
    },
    model: {
      id: row.model.id,
      name: row.model.name,
      slug: row.model.slug,
      reference: row.model.reference,
    },
    seller: {
      id: row.user.id,
      name: row.user.name,
      email: row.user.email,
    },
    images: row.images.map((img) => ({
      id: img.id,
      url: img.url,
      order: img.order,
    })),
    negotiationsCount: row.negotiations.length,
    activeNegotiationsCount: activeNegotiations,
    bestOffer,
  };
}

const detailInclude = {
  model: { include: { brand: true } },
  user: { select: { id: true, name: true, email: true } },
  images: { orderBy: { order: "asc" as const } },
  negotiations: {
    select: {
      id: true,
      status: true,
      offers: {
        select: { amount: true, status: true },
        orderBy: { amount: "desc" as const },
        take: 1,
      },
    },
  },
} as const;

// ---------------------------------------------------------------------------
// GET /api/listings/[id]
// ---------------------------------------------------------------------------
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = getPrisma();
  if (!db) return serverError("Database not configured");

  const { id } = await params;

  try {
    const row = await db.listing.findUnique({ where: { id }, include: detailInclude });

    if (!row) return notFound("Listing");
    if (row.status === "DELETED") return notFound("Listing");

    return ok(toDetail(row));
  } catch (e) {
    return serverError(e);
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/listings/[id]  — partial field update (NO status changes here)
// ---------------------------------------------------------------------------
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = getPrisma();
  if (!db) return serverError("Database not configured");

  const { id } = await params;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return badRequest("JSON inválido");
  }
  const body = raw as Record<string, unknown>;

  // Reject status changes — those belong to PATCH /status
  if ("status" in body) {
    return badRequest("Para cambiar el estado usa PATCH /api/listings/:id/status");
  }

  const data: Prisma.ListingUpdateInput = {};

  if (typeof body.title === "string" && body.title.trim()) {
    data.title = body.title.trim();
  }
  if ("description" in body) {
    data.description =
      body.description === null ? null : String(body.description).trim();
  }
  if (typeof body.price === "number") {
    if (!Number.isFinite(body.price) || body.price <= 0) {
      return badRequest("El precio debe ser un número positivo");
    }
    data.price = body.price;
  }
  if (typeof body.currency === "string") {
    data.currency = body.currency.toUpperCase();
  }
  if (typeof body.condition === "string") {
    if (!VALID_CONDITIONS.includes(body.condition as Condition)) {
      return badRequest(`Condición inválida. Valores válidos: ${VALID_CONDITIONS.join(", ")}`);
    }
    data.condition = body.condition as Condition;
  }
  if (typeof body.year === "number" || body.year === null) {
    data.year = body.year as number | null;
  }
  if (typeof body.hasBox === "boolean") data.hasBox = body.hasBox;
  if (typeof body.hasPapers === "boolean") data.hasPapers = body.hasPapers;

  if (Object.keys(data).length === 0) {
    return badRequest("No se proporcionaron campos para actualizar");
  }

  try {
    const existing = await db.listing.findUnique({ where: { id } });
    if (!existing || existing.status === "DELETED") return notFound("Listing");

    const row = await db.listing.update({
      where: { id },
      data,
      include: detailInclude,
    });
    return ok(toDetail(row));
  } catch (e) {
    return serverError(e);
  }
}
