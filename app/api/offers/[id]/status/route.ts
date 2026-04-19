export const runtime = "nodejs";

import { getPrisma } from "@/lib/prisma";
import { ok, badRequest, notFound, conflict, serverError } from "@/lib/api";
import { OfferStatus } from "@prisma/client";

const ALLOWED: OfferStatus[] = ["ACCEPTED", "REJECTED", "WITHDRAWN"];

// ---------------------------------------------------------------------------
// PATCH /api/offers/[id]/status
// ---------------------------------------------------------------------------
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = getPrisma();
  if (!db) return serverError("Database not configured");

  const { id: offerId } = await params;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return badRequest("JSON inválido");
  }
  const body = raw as Record<string, unknown>;
  const status = body.status as OfferStatus;

  if (!ALLOWED.includes(status)) {
    return badRequest(
      `Estado inválido. Valores permitidos: ${ALLOWED.join(", ")}`,
    );
  }

  try {
    const offer = await db.offer.findUnique({
      where: { id: offerId },
      include: {
        negotiation: {
          include: {
            listing: { select: { id: true, status: true, userId: true } },
          },
        },
      },
    });

    if (!offer) return notFound("Oferta");
    if (offer.status !== "PENDING") {
      return conflict("La oferta no está pendiente");
    }

    const neg = offer.negotiation;
    const listingId = neg.listingId;

    // ---------------------------------------------------------------------------
    // ACCEPTED → full atomic transaction
    // ---------------------------------------------------------------------------
    if (status === "ACCEPTED") {
      // Block double-acceptance: if listing already SOLD → 409
      if (neg.listing.status === "SOLD") {
        return conflict("Ya existe una oferta aceptada");
      }

      const result = await db.$transaction(async (tx) => {
        // 1. Set this offer → ACCEPTED
        await tx.offer.update({
          where: { id: offerId },
          data: { status: "ACCEPTED" },
        });

        // 2. Set negotiation → ACCEPTED
        await tx.negotiation.update({
          where: { id: neg.id },
          data: { status: "ACCEPTED" },
        });

        // 3. Set listing → SOLD
        const updated = await tx.listing.updateMany({
          where: { id: listingId, status: { not: "SOLD" } },
          data: { status: "SOLD", soldAt: new Date() },
        });
        if (updated.count === 0) {
          throw new Error("Ya existe una oferta aceptada");
        }

        // 4. Set all OTHER negotiations on same listing → CANCELLED
        const cancelled = await tx.negotiation.findMany({
          where: {
            listingId,
            status: "ACTIVE",
            NOT: { id: neg.id },
          },
          select: { id: true },
        });

        if (cancelled.length > 0) {
          const cancelledIds = cancelled.map((n) => n.id);
          await tx.negotiation.updateMany({
            where: { id: { in: cancelledIds } },
            data: { status: "CANCELLED" },
          });

          // 5. Set all PENDING offers in cancelled negotiations → REJECTED
          await tx.offer.updateMany({
            where: {
              negotiationId: { in: cancelledIds },
              status: "PENDING",
            },
            data: { status: "REJECTED" },
          });
        }

        // Create sale record
        await tx.sale.upsert({
          where: { listingId },
          create: {
            listingId,
            sellerId: neg.listing.userId,
            buyerId: neg.buyerId,
            finalPrice: offer.amount,
            currency: offer.currency,
          },
          update: {},
        });

        return tx.offer.findUniqueOrThrow({ where: { id: offerId } });
      });

      return ok({
        id: result.id,
        status: result.status,
        negotiationId: result.negotiationId,
        amount: result.amount.toString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // ---------------------------------------------------------------------------
    // REJECTED → set offer REJECTED, keep negotiation OPEN (ACTIVE)
    // ---------------------------------------------------------------------------
    if (status === "REJECTED") {
      await db.offer.update({
        where: { id: offerId },
        data: { status: "REJECTED" },
      });

      return ok({ id: offerId, status: "REJECTED" });
    }

    // ---------------------------------------------------------------------------
    // WITHDRAWN → set offer WITHDRAWN, keep negotiation OPEN (ACTIVE)
    // ---------------------------------------------------------------------------
    await db.offer.update({
      where: { id: offerId },
      data: { status: "WITHDRAWN" },
    });

    return ok({ id: offerId, status: "WITHDRAWN" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "Ya existe una oferta aceptada") return conflict(msg);
    return serverError(e);
  }
}
