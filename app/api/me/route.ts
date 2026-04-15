import { prisma } from "@/lib/prisma";
import { getUserIdFromCookie } from "@/lib/getUser";

export async function GET() {
  const userId = await getUserIdFromCookie();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  const listings = await prisma.listing.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const negotiations = await prisma.negotiation.findMany({
    where: {
      OR: [
        { buyerId: userId },
        { sellerId: userId },
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
