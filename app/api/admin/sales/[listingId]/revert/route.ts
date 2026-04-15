// ADMIN: remove auth bypass before production
import { getPrisma } from "@/lib/prisma";
import { ok, notFound, conflict, serverError } from "@/lib/api";

// ---------------------------------------------------------------------------
// POST /api/admin/sales/[listingId]/revert
// Reverts a completed sale — testing only
// ---------------------------------------------------------------------------
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ listingId: string }> },
) {
  const db = getPrisma();
  if (!db) return serverError("Database not configured");

  const { listingId } = await params;

  try {
    const listing = await db.listing.findUnique({ where: { id: listingId } });
    if (!listing) return notFound("Listing");

    if (listing.status !== "SOLD") {
      return conflict("El listing no está en estado SOLD, nada que revertir");
    }

    console.warn(`[ADMIN] Sale revert initiated — listing ${listingId}`);

    await db.$transaction(async (tx) => {
      // 1. Find the winning negotiation (ACCEPTED)
      const winningNeg = await tx.negotiation.findFirst({
        where: { listingId, status: "ACCEPTED" },
        select: { id: true },
      });

      if (winningNeg) {
        // 2. Winning negotiation → ACTIVE (OPEN)
        await tx.negotiation.update({
          where: { id: winningNeg.id },
          data: { status: "ACTIVE" },
        });

        // 3. Winning offer → PENDING
        await tx.offer.updateMany({
          where: { negotiationId: winningNeg.id, status: "ACCEPTED" },
          data: { status: "PENDING" },
        });
      }

      // 4. All cancelled negotiations → ACTIVE (OPEN)
      await tx.negotiation.updateMany({
        where: { listingId, status: "CANCELLED" },
        data: { status: "ACTIVE" },
      });

      // 5. Listing → ACTIVE
      await tx.listing.update({
        where: { id: listingId },
        data: { status: "ACTIVE", soldAt: null },
      });

      // 6. Remove sale record
      await tx.sale.deleteMany({ where: { listingId } });
    });

    console.warn(`[ADMIN] Sale revert complete — listing ${listingId}`);

    return ok({ listingId, reverted: true });
  } catch (e) {
    return serverError(e);
  }
}
