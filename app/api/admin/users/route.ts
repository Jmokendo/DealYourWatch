export const runtime = "nodejs";

import { requireSuperAdmin } from "@/lib/admin-auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireSuperAdmin();
  if ("status" in auth) return jsonError(auth.message, auth.status);

  const prisma = getPrisma();
  if (!prisma) return jsonOk([]);

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isBanned: true,
      createdAt: true,
      _count: {
        select: {
          listings: true,
          offers: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return jsonOk(
    users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      isBanned: u.isBanned,
      createdAt: u.createdAt.toISOString(),
      listingCount: u._count.listings,
      negotiationCount: u._count.offers,
    })),
  );
}
