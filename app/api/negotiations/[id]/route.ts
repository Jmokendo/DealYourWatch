export const runtime = "nodejs";

import { getPrisma } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

// ---------------------------------------------------------------------------
// GET /api/negotiations/[id]
// Full detail: listing summary + buyer + seller + all offers ordered by createdAt
// ---------------------------------------------------------------------------
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = getPrisma();
  if (!db) return serverError("Database not configured");

  const { id } = await params;

  try {
    const neg = await db.negotiation.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            model: { include: { brand: true } },
            user: { select: { id: true, name: true, email: true } },
            images: { orderBy: { order: "asc" }, take: 1 },
          },
        },
        offers: { orderBy: { createdAt: "asc" } },
        thread: { select: { id: true } },
      },
    });

    if (!neg) return notFound("Negociación");

    // Resolve buyer
    const buyer = await db.user.findUnique({
      where: { id: neg.buyerId },
      select: { id: true, name: true, email: true },
    });

    return ok({
      id: neg.id,
      status: neg.status,
      round: neg.round,
      expiresAt: neg.expiresAt.toISOString(),
      createdAt: neg.createdAt.toISOString(),
      updatedAt: neg.updatedAt.toISOString(),
      threadId: neg.thread?.id ?? null,
      listing: {
        id: neg.listing.id,
        title: neg.listing.title,
        price: neg.listing.price.toString(),
        currency: neg.listing.currency,
        condition: neg.listing.condition,
        status: neg.listing.status,
        firstImage: neg.listing.images[0]?.url ?? null,
        brand: {
          id: neg.listing.model.brand.id,
          name: neg.listing.model.brand.name,
          slug: neg.listing.model.brand.slug,
        },
        seller: {
          id: neg.listing.user.id,
          name: neg.listing.user.name,
          email: neg.listing.user.email,
        },
      },
      buyer: buyer
        ? { id: buyer.id, name: buyer.name, email: buyer.email }
        : { id: neg.buyerId, name: null, email: null },
      offers: neg.offers.map((o) => ({
        id: o.id,
        userId: o.userId,
        amount: o.amount.toString(),
        currency: o.currency,
        reasonType: o.reasonType,
        reasonNote: o.reasonNote,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    return serverError(e);
  }
}
