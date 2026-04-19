import { requireAdmin } from "@/lib/admin-auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { getPrisma } from "@/lib/prisma";
import { VALID_LISTING_STATUSES } from "@/lib/api/contracts";
import type { ListingStatus } from "@/lib/api/contracts";
import { toAdminListing } from "@/lib/api/admin-queries";

const ADMIN_LISTING_SELECT = {
  id: true,
  title: true,
  price: true,
  currency: true,
  status: true,
  createdAt: true,
  user: { select: { id: true, email: true, name: true } },
} as const;

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return jsonError("Unauthorized", 401);

  const prisma = getPrisma();
  if (!prisma) return jsonOk([]);

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status") as ListingStatus | null;
  const status =
    statusParam && VALID_LISTING_STATUSES.includes(statusParam) ? statusParam : null;

  const listings = await prisma.listing.findMany({
    where: status ? { status } : undefined,
    select: ADMIN_LISTING_SELECT,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return jsonOk(listings.map(toAdminListing));
}
