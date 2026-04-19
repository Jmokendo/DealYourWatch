import { requireAdmin } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api/http";
import type { OfferStatus } from "@/lib/api/contracts";

export interface AdminOffer {
  id: string;
  negotiationId: string;
  listingId: string;
  listingTitle: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  amount: string;
  currency: string;
  reasonType: string;
  status: OfferStatus;
  createdAt: string;
}

export async function GET() {
  const result = await requireAdmin();
  if (!result) return jsonError("Unauthorized", 401);

  const db = getPrisma();
  if (!db) return jsonOk([]);

  const rows = await db.offer.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { id: true, email: true, name: true } },
      negotiation: {
        include: { listing: { select: { id: true, title: true } } },
      },
    },
  });

  return jsonOk(
    rows.map(
      (r): AdminOffer => ({
        id: r.id,
        negotiationId: r.negotiationId,
        listingId: r.negotiation.listing.id,
        listingTitle: r.negotiation.listing.title,
        userId: r.user.id,
        userEmail: r.user.email,
        userName: r.user.name,
        amount: r.amount.toString(),
        currency: r.currency,
        reasonType: r.reasonType,
        status: r.status as OfferStatus,
        createdAt: r.createdAt.toISOString(),
      }),
    ),
  );
}
