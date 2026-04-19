export const runtime = "nodejs";

import { requireAdmin } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api/http";
import type { NegotiationStatus } from "@/lib/api/contracts";

export interface AdminNegotiation {
  id: string;
  listingId: string;
  listingTitle: string;
  buyerId: string;
  buyerEmail: string;
  buyerName: string | null;
  status: NegotiationStatus;
  round: number;
  createdAt: string;
}

export async function GET() {
  const result = await requireAdmin();
  if (!result) return jsonError("Unauthorized", 401);

  const db = getPrisma();
  if (!db) return jsonOk([]);

  const rows = await db.negotiation.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      listing: { select: { title: true } },
      buyer: { select: { id: true, email: true, name: true } },
    },
  });

  return jsonOk(
    rows.map(
      (r): AdminNegotiation => ({
        id: r.id,
        listingId: r.listingId,
        listingTitle: r.listing.title,
        buyerId: r.buyer.id,
        buyerEmail: r.buyer.email,
        buyerName: r.buyer.name,
        status: r.status as NegotiationStatus,
        round: r.round,
        createdAt: r.createdAt.toISOString(),
      }),
    ),
  );
}
