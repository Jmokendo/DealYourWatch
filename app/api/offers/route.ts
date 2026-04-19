export const runtime = "nodejs";

import { getPrisma } from "@/lib/prisma";
import { ok, created, badRequest, notFound, conflict, serverError, requireFields } from "@/lib/api";

// ---------------------------------------------------------------------------
// POST /api/offers
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  const db = getPrisma();
  if (!db) return serverError("Database not configured");

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return badRequest("JSON inválido");
  }
  const body = raw as Record<string, unknown>;

  // TODO: replace with session.user.id
  const missing = requireFields(body, ["negotiationId", "userId", "amount"]);
  if (missing) return badRequest(missing);

  const negotiationId = String(body.negotiationId);
  const userId = String(body.userId); // TODO: replace with session.user.id
  const amount = Number(body.amount);
  const message =
    typeof body.message === "string" ? body.message.trim() || null : null;
  const currency =
    typeof body.currency === "string" ? body.currency.toUpperCase() : "USD";

  if (!Number.isFinite(amount) || amount <= 0) {
    return badRequest("El monto debe ser un número positivo");
  }

  try {
    const neg = await db.negotiation.findUnique({
      where: { id: negotiationId },
      include: {
        listing: { select: { id: true, status: true } },
        offers: { select: { id: true } },
      },
    });

    if (!neg) return notFound("Negociación");

    // Listing must be ACTIVE
    if (neg.listing.status !== "ACTIVE") {
      return conflict("Este listing ya fue vendido");
    }

    // Negotiation must be OPEN (ACTIVE)
    if (neg.status === "ACCEPTED") {
      return conflict("Ya existe una oferta aceptada");
    }
    if (neg.status !== "ACTIVE") {
      return conflict("La negociación no está abierta");
    }

    // Max 3 rounds
    const offerCount = neg.offers.length;
    if (offerCount >= 3) {
      return badRequest("Máximo 3 rondas de negociación permitidas");
    }

    // Validate user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return badRequest("El usuario indicado no existe");

    const offer = await db.$transaction(async (tx) => {
      const newOffer = await tx.offer.create({
        data: {
          negotiationId,
          userId,
          amount,
          currency,
          reasonType: offerCount === 0 ? "OFFER" : "COUNTER",
          reasonNote: message,
          status: "PENDING",
        },
      });
      // Touch negotiation.updatedAt
      await tx.negotiation.update({
        where: { id: negotiationId },
        data: { updatedAt: new Date() },
      });
      return newOffer;
    });

    return created({
      id: offer.id,
      negotiationId: offer.negotiationId,
      userId: offer.userId,
      amount: offer.amount.toString(),
      currency: offer.currency,
      reasonType: offer.reasonType,
      reasonNote: offer.reasonNote,
      status: offer.status,
      createdAt: offer.createdAt.toISOString(),
    });
  } catch (e) {
    return serverError(e);
  }
}
