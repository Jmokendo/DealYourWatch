import { getPrisma } from "@/lib/prisma";
import { ok, created, badRequest, notFound, conflict, serverError, requireFields } from "@/lib/api";

// ---------------------------------------------------------------------------
// POST /api/negotiations
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
  const missing = requireFields(body, ["listingId", "buyerId"]);
  if (missing) return badRequest(missing);

  const listingId = String(body.listingId);
  const buyerId = String(body.buyerId); // TODO: replace with session.user.id

  try {
    const listing = await db.listing.findUnique({
      where: { id: listingId },
      select: { id: true, status: true, userId: true },
    });

    if (!listing || listing.status === "DELETED") return notFound("Listing");

    // Listing must be ACTIVE
    if (listing.status !== "ACTIVE") {
      return conflict("El listing no está disponible para negociación");
    }

    // Buyer cannot be the seller
    if (listing.userId === buyerId) {
      return badRequest("El comprador no puede ser el vendedor");
    }

    // Validate buyer exists
    const buyer = await db.user.findUnique({ where: { id: buyerId } });
    if (!buyer) return badRequest("El comprador indicado no existe");

    // Only one open negotiation per buyer+listing (return existing if exists)
    const existing = await db.negotiation.findFirst({
      where: { listingId, buyerId, status: "ACTIVE" },
      include: { thread: true },
    });

    if (existing) {
      return ok(toSummary(existing, existing.thread?.id ?? null));
    }

    // Create negotiation + thread in a transaction
    const days = typeof body.expiresInDays === "number" ? body.expiresInDays : 7;
    const expiresAt = new Date(Date.now() + days * 864e5);

    const result = await db.$transaction(async (tx) => {
      const neg = await tx.negotiation.create({
        data: { listingId, buyerId, expiresAt },
      });
      await tx.thread.create({
        data: { negotiationId: neg.id, buyerId },
      });
      return tx.negotiation.findUniqueOrThrow({
        where: { id: neg.id },
        include: { thread: true },
      });
    });

    return created(toSummary(result, result.thread?.id ?? null));
  } catch (e) {
    return serverError(e);
  }
}

// ---------------------------------------------------------------------------
// Serializer
// ---------------------------------------------------------------------------
function toSummary(
  n: {
    id: string;
    listingId: string;
    buyerId: string;
    status: string;
    round: number;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
  },
  threadId: string | null,
) {
  return {
    id: n.id,
    listingId: n.listingId,
    buyerId: n.buyerId,
    threadId,
    status: n.status,
    round: n.round,
    expiresAt: n.expiresAt.toISOString(),
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  };
}
