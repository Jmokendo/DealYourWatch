import type { PrismaClient } from "@prisma/client";
import type { OfferDto } from "@/lib/api/contracts";
import { toOfferDto } from "@/lib/api/serialize-offer";
import {
  isNegotiationParticipant,
  loadNegotiationWithSeller,
} from "@/lib/api/negotiation-access";
import { ServiceError, serviceFail, serviceOk, type ServiceResult } from "@/lib/services/types";

export async function acceptOffer(
  db: PrismaClient,
  negotiationId: string,
  offerId: string,
  userId: string,
): Promise<ServiceResult<OfferDto>> {
  const neg = await loadNegotiationWithSeller(db, negotiationId);
  if (!neg) return serviceFail("Negotiation not found", 404);

  const sellerId = neg.listing.userId;
  if (!isNegotiationParticipant(userId, neg.buyerId, sellerId))
    return serviceFail("Forbidden", 403);
  if (neg.listing.status === "SOLD") return serviceFail("Listing is sold", 409);
  if (neg.status !== "ACTIVE") return serviceFail("Negotiation is not active", 409);

  const existing = await db.offer.findFirst({ where: { id: offerId, negotiationId } });
  if (!existing) return serviceFail("Offer not found", 404);
  if (existing.status !== "PENDING") return serviceFail("Offer is not pending", 409);
  if (existing.userId === userId) return serviceFail("Cannot respond to your own offer", 403);

  try {
    const updatedOffer = await db.$transaction(async (tx) => {
      const fullNeg = await tx.negotiation.findUnique({
        where: { id: negotiationId },
        select: { id: true, status: true, listingId: true },
      });
      if (!fullNeg) throw new ServiceError("Negotiation not found", 404);

      const listing = await tx.listing.findUnique({
        where: { id: fullNeg.listingId },
        select: { id: true, status: true, userId: true },
      });
      if (!listing) throw new ServiceError("Listing not found", 404);
      if (listing.status === "SOLD") throw new ServiceError("Listing is sold", 409);

      const otherAccepted = await tx.negotiation.findFirst({
        where: {
          listingId: fullNeg.listingId,
          status: { in: ["ACCEPTED", "CLOSED"] },
          NOT: { id: negotiationId },
        },
        select: { id: true },
      });
      if (otherAccepted) throw new ServiceError("Listing already has an accepted negotiation", 409);

      const offerUpdated = await tx.offer.updateMany({
        where: { id: offerId, negotiationId, status: "PENDING" },
        data: { status: "ACCEPTED" },
      });
      if (offerUpdated.count !== 1) throw new ServiceError("Offer is not pending", 409);

      const negUpdated = await tx.negotiation.updateMany({
        where: { id: negotiationId, status: "ACTIVE" },
        data: { status: "CLOSED" },
      });
      if (negUpdated.count !== 1) throw new ServiceError("Negotiation is not active", 409);

      const listingUpdated = await tx.listing.updateMany({
        where: { id: fullNeg.listingId, status: { not: "SOLD" } },
        data: { status: "SOLD", soldAt: new Date() },
      });
      if (listingUpdated.count !== 1) throw new ServiceError("Listing is sold", 409);

      const existingSale = await tx.sale.findUnique({
        where: { listingId: fullNeg.listingId },
        select: { id: true },
      });
      if (existingSale) throw new ServiceError("Sale already exists for listing", 409);

      await tx.sale.create({
        data: {
          listingId: fullNeg.listingId,
          buyerId: neg.buyerId,
          sellerId: listing.userId,
          finalPrice: existing.amount,
          currency: existing.currency,
        },
      });

      await tx.negotiation.updateMany({
        where: {
          listingId: fullNeg.listingId,
          status: "ACTIVE",
          NOT: { id: negotiationId },
        },
        data: { status: "EXPIRED" },
      });

      return tx.offer.findUniqueOrThrow({ where: { id: offerId } });
    });

    return serviceOk(toOfferDto(updatedOffer));
  } catch (e) {
    const status = e instanceof ServiceError ? e.status : 500;
    const msg = e instanceof Error ? e.message : "Failed to accept offer";
    return serviceFail(msg, status);
  }
}
