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

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdminUser();
  if (!admin) return jsonError("Forbidden", 403);

  const { id } = await ctx.params;

  let body: { action: "approve" | "reject" };
  try {
    body = (await req.json()) as { action: "approve" | "reject" };
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  if (body.action !== "approve" && body.action !== "reject") {
    return jsonError('action must be "approve" or "reject"', 400);
  }

  const db = getPrisma();
  if (!db) return jsonError("Database not configured", 503);

  const existing = await db.listing.findUnique({ where: { id } });
  if (!existing) return jsonError("Listing not found", 404);

  const newStatus = body.action === "approve" ? "APPROVED" : "REJECTED";

  const updated = await db.listing.update({
    where: { id },
    data: { status: newStatus },
    include: listInclude,
  });

  return jsonOk(toListingSummary(updated));
}
