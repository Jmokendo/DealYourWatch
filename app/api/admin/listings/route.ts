import { requireAdmin } from "@/lib/admin-auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { getPrisma } from "@/lib/prisma";
import type { ListingStatus } from "@/lib/api/contracts";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return jsonError("Unauthorized", 401);

  const prisma = getPrisma();
  if (!prisma) return jsonOk([]);

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status") as ListingStatus | null;

  const validStatuses: ListingStatus[] = [
    "PENDING",
    "APPROVED",
    "SOLD",
    "REJECTED",
    "EXPIRED",
  ];
  const status =
    statusParam && validStatuses.includes(statusParam) ? statusParam : null;

  const listings = await prisma.listing.findMany({
    where: status ? { status } : undefined,
    select: {
      id: true,
      title: true,
      price: true,
      currency: true,
      status: true,
      createdAt: true,
      user: { select: { id: true, email: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return jsonOk(
    listings.map((l) => ({
      id: l.id,
      title: l.title,
      price: l.price.toString(),
      currency: l.currency,
      status: l.status,
      owner: l.user,
      createdAt: l.createdAt.toISOString(),
    })),
  );
}
