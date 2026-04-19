import { requireAdmin, requireSuperAdmin } from "@/lib/admin-auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { getPrisma } from "@/lib/prisma";
import { VALID_LISTING_STATUSES } from "@/lib/api/contracts";
import type { ListingStatus } from "@/lib/api/contracts";
import { adminApproveListing } from "@/lib/services/admin-service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminId = await requireAdmin();
  if (!adminId) return jsonError("Forbidden", 403);

  const { id } = await params;
  const db = getPrisma();
  if (!db) return jsonError("Service unavailable", 503);

  const raw = await request.json().catch(() => null);
  if (!raw || typeof raw !== "object") return jsonError("Invalid body", 400);

  const status = (raw as Record<string, unknown>).status as ListingStatus | undefined;
  if (!status || !VALID_LISTING_STATUSES.includes(status)) {
    return jsonError("Invalid or missing status", 400);
  }

  const result = await adminApproveListing(db, id, status);
  if (!result.ok) return jsonError(result.error, result.status);
  return jsonOk(result.data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSuperAdmin();
  if ("status" in auth) return jsonError(auth.message, auth.status);

  const { id } = await params;
  const prisma = getPrisma();
  if (!prisma) return jsonError("Service unavailable", 503);

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      negotiations: {
        select: { id: true, thread: { select: { id: true } } },
      },
    },
  });
  if (!listing) return jsonError("Not found", 404);

  const negotiationIds = listing.negotiations.map((n) => n.id);
  const threadIds = listing.negotiations
    .map((n) => n.thread?.id)
    .filter((tid): tid is string => tid != null);

  await prisma.$transaction([
    prisma.message.deleteMany({ where: { threadId: { in: threadIds } } }),
    prisma.thread.deleteMany({ where: { id: { in: threadIds } } }),
    prisma.offer.deleteMany({ where: { negotiationId: { in: negotiationIds } } }),
    prisma.negotiation.deleteMany({ where: { listingId: id } }),
    prisma.valuation.deleteMany({ where: { listingId: id } }),
    prisma.sale.deleteMany({ where: { listingId: id } }),
    prisma.listing.delete({ where: { id } }),
  ]);

  return jsonOk({ ok: true });
}
