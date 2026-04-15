// ADMIN: remove auth bypass before production
import { getPrisma } from "@/lib/prisma";
import { ok, badRequest, notFound, serverError } from "@/lib/api";
import { NegotiationStatus } from "@prisma/client";

const VALID_STATUSES: NegotiationStatus[] = [
  "ACTIVE", "ACCEPTED", "REJECTED", "CANCELLED", "EXPIRED",
];

// ---------------------------------------------------------------------------
// POST /api/admin/negotiations/[id]/force-status
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
  const status = body.status as NegotiationStatus;

  if (!VALID_STATUSES.includes(status)) {
    return badRequest(`Estado inválido. Valores permitidos: ${VALID_STATUSES.join(", ")}`);
  }

  try {
    const existing = await db.negotiation.findUnique({ where: { id } });
    if (!existing) return notFound("Negociación");

    console.warn(`[ADMIN] Force status applied — negotiation ${id}: ${existing.status} → ${status}`);

    const updated = await db.negotiation.update({
      where: { id },
      data: { status },
      select: { id: true, status: true, updatedAt: true },
    });

    return ok({
      id: updated.id,
      status: updated.status,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (e) {
    return serverError(e);
  }
}
