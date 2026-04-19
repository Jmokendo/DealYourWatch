import type { PrismaClient } from "@prisma/client";
import type { NegotiationStatus, UserNegotiation } from "@/lib/api/contracts";
import { serviceOk, type ServiceResult } from "@/lib/services/types";

export async function getUserNegotiations(
  db: PrismaClient,
  userId: string,
): Promise<ServiceResult<UserNegotiation[]>> {
  const rows = await db.negotiation.findMany({
    where: { buyerId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      listing: { select: { title: true } },
      thread: { select: { id: true } },
    },
  });

  return serviceOk(
    rows.map(
      (r): UserNegotiation => ({
        id: r.id,
        listingId: r.listingId,
        listingTitle: r.listing.title,
        status: r.status as NegotiationStatus,
        round: r.round,
        expiresAt: r.expiresAt.toISOString(),
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        threadId: r.thread?.id ?? null,
      }),
    ),
  );
}
