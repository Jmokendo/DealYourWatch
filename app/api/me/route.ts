export const runtime = "nodejs";

import { getPrisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth-session";

export async function GET() {
  const authUser = await requireAuthUser();
  if (!authUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getPrisma();
  if (!db) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }

  const user = await db.user.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  const listings = await db.listing.findMany({
    where: { userId: authUser.id },
    orderBy: { createdAt: "desc" },
  });

  const negotiations = await db.negotiation.findMany({
    where: {
      OR: [
        { buyerId: authUser.id },
        { listing: { userId: authUser.id } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({
    user,
    listings,
    negotiations,
  });
}
