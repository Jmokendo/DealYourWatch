import { getPrisma } from "@/lib/prisma";
import { ok, badRequest, notFound, conflict, serverError } from "@/lib/api";
import { ListingStatus } from "@prisma/client";

const ALLOWED_STATUSES: ListingStatus[] = ["ACTIVE", "PAUSED", "SOLD", "DELETED"];

// ---------------------------------------------------------------------------
// PATCH /api/listings/[id]/status
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
  const status = body.status as ListingStatus;

  if (!ALLOWED_STATUSES.includes(status)) {
    return badRequest(
      `Estado inválido. Valores permitidos: ${ALLOWED_STATUSES.join(", ")}`,
    );
  }

  try {
    const existing = await db.listing.findUnique({ where: { id } });
    if (!existing) return notFound("Listing");

    // Business rule: cannot reactivate a SOLD listing
    if (existing.status === "SOLD" && (status === "ACTIVE" || status === "PAUSED")) {
      return conflict("No se puede reactivar un listing vendido");
    }

    // Business rule: DELETED is soft-delete — never hard delete
    // (setting to DELETED is allowed; moving away from DELETED is not)
    if (existing.status === "DELETED" && status !== "DELETED") {
      return conflict("Un listing eliminado no puede cambiar de estado");
    }

    const updated = await db.listing.update({
      where: { id },
      data: {
        status,
        ...(status === "SOLD" ? { soldAt: new Date() } : {}),
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
