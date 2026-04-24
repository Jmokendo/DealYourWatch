export const runtime = "nodejs";

import { requireSuperAdmin } from "@/lib/admin-auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireSuperAdmin();
  if ("status" in auth) return jsonError(auth.message, auth.status);

  const prisma = getPrisma();
  if (!prisma) {
    return jsonOk({
      totalListings: 0,
      activeListings: 0,
      pendingListings: 0,
      rejectedListings: 0,
      soldListings: 0,
      totalUsers: 0,
    });
  }

  const [
    totalListings,
    activeListings,
    pendingListings,
    rejectedListings,
    soldListings,
    totalUsers,
  ] = await Promise.all([
    prisma.listing.count(),
    prisma.listing.count({ where: { status: "APPROVED" } }),
    prisma.listing.count({ where: { status: "PENDING" } }),
    prisma.listing.count({ where: { status: "REJECTED" } }),
    prisma.listing.count({ where: { status: "SOLD" } }),
    prisma.user.count(),
  ]);

  return jsonOk({
    totalListings,
    activeListings,
    pendingListings,
    rejectedListings,
    soldListings,
    totalUsers,
  });
}
