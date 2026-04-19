export const runtime = "nodejs";

import { isApiMockMode } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api/http";
import { mockListings, mockValuations } from "@/lib/api/mock-data";
import type { ValuationDto, ValuationJobAccepted } from "@/lib/api/contracts";
import { requireAuthUser } from "@/lib/auth-session";

function toValuationDto(row: {
  id: string;
  listingId: string;
  chrono24Price: { toString(): string } | null;
  mlPrice: { toString(): string } | null;
  localDelta: { toString(): string } | null;
  conditionDelta: { toString(): string } | null;
  boxPapersDelta: { toString(): string } | null;
  notes: string | null;
  sources: unknown;
  createdAt: Date;
  updatedAt: Date;
}): ValuationDto {
  return {
    id: row.id,
    listingId: row.listingId,
    chrono24Price: row.chrono24Price?.toString() ?? null,
    mlPrice: row.mlPrice?.toString() ?? null,
    localDelta: row.localDelta?.toString() ?? null,
    conditionDelta: row.conditionDelta?.toString() ?? null,
    boxPapersDelta: row.boxPapersDelta?.toString() ?? null,
    notes: row.notes,
    sources: Array.isArray(row.sources) ? row.sources : [],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  if (isApiMockMode()) {
    const v = mockValuations[id];
    return jsonOk(v ?? null);
  }

  const db = getPrisma();
  if (!db) {
    return jsonOk(mockValuations[id] ?? null);
  }

  const row = await db.valuation.findUnique({ where: { listingId: id } });
  return jsonOk(row ? toValuationDto(row) : null);
}

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await requireAuthUser();
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await ctx.params;

  const accepted: ValuationJobAccepted = {
    jobId: `val-job-${id}-${Date.now()}`,
    status: "queued",
  };

  if (isApiMockMode()) {
    const listing = mockListings.find((l) => l.id === id);
    if (!listing) return jsonError("Listing not found", 404);
    if (listing.user.id !== user.id) return jsonError("Forbidden", 403);
    return jsonOk(accepted, { status: 202 });
  }

  const db = getPrisma();
  if (!db) return jsonOk(accepted, { status: 202 });

  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) return jsonError("Listing not found", 404);
  if (listing.userId !== user.id) return jsonError("Forbidden", 403);

  return jsonOk(accepted, { status: 202 });
}
