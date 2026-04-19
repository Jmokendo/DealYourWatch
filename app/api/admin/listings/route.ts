export const runtime = "nodejs";

import { getPrisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api/http";
import { requireAdminUser } from "@/lib/auth-session";
import { toListingSummary } from "@/lib/api/serialize-listing";

const listInclude = {
  images: { orderBy: { order: "asc" as const } },
  model: { include: { brand: true } },
  user: true,
} as const;

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) return jsonError("Forbidden", 403);

  const db = getPrisma();
  if (!db) return jsonError("Database not configured", 503);

  const rows = await db.listing.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: listInclude,
  });

  return jsonOk(rows.map(toListingSummary));
}
