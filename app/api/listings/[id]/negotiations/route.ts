export const runtime = "nodejs";

import { getPrisma } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

// ---------------------------------------------------------------------------
// GET /api/listings/[id]/negotiations
// All negotiations for a listing: offers count, latest offer, status
// ---------------------------------------------------------------------------
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = getPrisma();
  if (!db) return serverError("Database not configured");

  const { id } = await params;

  try {
    const listing = await db.listing.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!listing || listing.status === "DELETED") return notFound("Listing");

    const rows = await db.negotiation.findMany({
      where: { listingId: id },
      orderBy: { createdAt: "desc" },
      include: {
        thread: { select: { id: true } },
        offers: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            userId: true,
            amount: true,
            currency: true,
            status: true,
            createdAt: true,
          },
        },
        _count: { select: { offers: true } },
      },
    });

    return ok(
      rows.map((n) => ({
        id: n.id,
        buyerId: n.buyerId,
        status: n.status,
        round: n.round,
        expiresAt: n.expiresAt.toISOString(),
        createdAt: n.createdAt.toISOString(),
        updatedAt: n.updatedAt.toISOString(),
        threadId: n.thread?.id ?? null,
        offersCount: n._count.offers,
        latestOffer: n.offers[0]
          ? {
              id: n.offers[0].id,
              userId: n.offers[0].userId,
              amount: n.offers[0].amount.toString(),
              currency: n.offers[0].currency,
              status: n.offers[0].status,
              createdAt: n.offers[0].createdAt.toISOString(),
            }
          : null,
      })),
    );
  } catch (e) {
    return serverError(e);
  }
}
