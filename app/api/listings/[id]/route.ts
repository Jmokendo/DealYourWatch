import { isApiMockMode } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api/http";
import { mockListings } from "@/lib/api/mock-data";
import { toListingDetail } from "@/lib/api/serialize-listing";
import type { ListingDetail, PatchListingBody } from "@/lib/api/contracts";
import { mockValuations } from "@/lib/api/mock-data";

const detailInclude = {
  images: { orderBy: { order: "asc" as const } },
  model: { include: { brand: true } },
  user: true,
  valuation: true,
} as const;

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  if (isApiMockMode()) {
    const found = mockListings.find((l) => l.id === id);
    if (!found) return jsonError("Listing not found", 404);
    const detail: ListingDetail = {
      ...found,
      valuation: mockValuations[id] ?? null,
    };
    return jsonOk(detail);
  }

  const db = getPrisma();
  if (!db) {
    const found = mockListings.find((l) => l.id === id);
    if (!found) return jsonError("Listing not found", 404);
    return jsonOk({ ...found, valuation: mockValuations[id] ?? null });
  }

  const row = await db.listing.findUnique({
    where: { id },
    include: detailInclude,
  });

  if (!row) return jsonError("Listing not found", 404);
  return jsonOk(toListingDetail(row));
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  if (isApiMockMode()) {
    const found = mockListings.find((l) => l.id === id);
    if (!found) return jsonError("Listing not found", 404);
    let body: PatchListingBody;
    try {
      body = (await req.json()) as PatchListingBody;
    } catch {
      return jsonError("Invalid JSON body", 400);
    }
    if (body.title !== undefined) found.title = body.title;
    if (body.description !== undefined) found.description = body.description;
    if (body.price !== undefined) found.price = body.price.toFixed(2);
    if (body.condition !== undefined) found.condition = body.condition;
    if (body.status !== undefined) found.status = body.status;
    if (body.hasBox !== undefined) found.hasBox = body.hasBox;
    if (body.hasPapers !== undefined) found.hasPapers = body.hasPapers;
    found.updatedAt = new Date().toISOString();
    const detail: ListingDetail = {
      ...found,
      valuation: mockValuations[id] ?? null,
    };
    return jsonOk(detail);
  }

  const db = getPrisma();
  if (!db) return jsonError("Database not configured", 503);

  let body: PatchListingBody;
  try {
    body = (await req.json()) as PatchListingBody;
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.price !== undefined) data.price = body.price;
  if (body.condition !== undefined) data.condition = body.condition;
  if (body.status !== undefined) data.status = body.status;
  if (body.hasBox !== undefined) data.hasBox = body.hasBox;
  if (body.hasPapers !== undefined) data.hasPapers = body.hasPapers;

  try {
    const row = await db.listing.update({
      where: { id },
      data,
      include: detailInclude,
    });
    return jsonOk(toListingDetail(row));
  } catch {
    return jsonError("Listing not found", 404);
  }
}
