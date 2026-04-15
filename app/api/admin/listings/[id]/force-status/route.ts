// ADMIN: remove auth bypass before production
import { getPrisma } from "@/lib/prisma";
import { ok, badRequest, notFound, serverError } from "@/lib/api";
import { ListingStatus } from "@prisma/client";

const VALID_STATUSES: ListingStatus[] = [
  "ACTIVE", "PAUSED", "SOLD", "DELETED", "PENDING", "APPROVED", "REJECTED", "EXPIRED",
];

// ---------------------------------------------------------------------------
// POST /api/admin/listings/[id]/force-status
// Bypasses all business rules — testing only
// ---------------------------------------------------------------------------
export async function POST(
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
  const status = body.status as ListingStatus;

  if (!VALID_STATUSES.includes(status)) {
    return badRequest(`Estado inválido. Valores permitidos: ${VALID_STATUSES.join(", ")}`);
  }

  try {
    const existing = await db.listing.findUnique({ where: { id } });
    if (!existing) return notFound("Listing");

    console.warn(`[ADMIN] Force status applied — listing ${id}: ${existing.status} → ${status}`);

    const updated = await db.listing.update({
      where: { id },
      data: {
        status,
        ...(status === "SOLD" && !existing.soldAt ? { soldAt: new Date() } : {}),
      },
      select: { id: true, status: true, soldAt: true, updatedAt: true },
    });

    return ok({
      id: updated.id,
      status: updated.status,
      soldAt: updated.soldAt?.toISOString() ?? null,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (e) {
    return serverError(e);
  }
}
