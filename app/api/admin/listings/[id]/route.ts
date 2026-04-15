import { requireAdmin } from "@/lib/admin-auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { getPrisma } from "@/lib/prisma";
import type { ListingStatus } from "@/lib/api/contracts";

const VALID_STATUSES: ListingStatus[] = [
  "PENDING",
  "APPROVED",
  "SOLD",
  "REJECTED",
  "EXPIRED",
];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return jsonError("Unauthorized", 401);

  const { id } = await params;
  const prisma = getPrisma();
  if (!prisma) return jsonError("Service unavailable", 503);

  const raw = await request.json().catch(() => null);
  if (!raw || typeof raw !== "object") return jsonError("Invalid body", 400);

  const o = raw as Record<string, unknown>;
  const status = o.status as ListingStatus | undefined;

  if (!status || !VALID_STATUSES.includes(status)) {
    return jsonError("Invalid or missing status", 400);
  }

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return jsonError("Not found", 404);

  const updated = await prisma.listing.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      title: true,
      price: true,
      currency: true,
      status: true,
      createdAt: true,
      user: { select: { id: true, email: true, name: true } },
    },
  });

  return jsonOk({
    id: updated.id,
    title: updated.title,
    price: updated.price.toString(),
    currency: updated.currency,
    status: updated.status,
    owner: updated.user,
    createdAt: updated.createdAt.toISOString(),
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return jsonError("Unauthorized", 401);

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

  // Delete in dependency order; ListingImage cascades automatically.
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
