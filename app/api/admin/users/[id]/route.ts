import { requireSuperAdmin } from "@/lib/admin-auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { getPrisma } from "@/lib/prisma";
import { adminBanUser } from "@/lib/services/admin-service";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireSuperAdmin();
  if ("status" in auth) return jsonError(auth.message, auth.status);

  const { id } = await params;
  const db = getPrisma();
  if (!db) return jsonError("Database not configured", 503);

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  if (typeof body.isBanned !== "boolean") {
    return jsonError("No valid fields to update", 400);
  }

  const result = await adminBanUser(db, id, body.isBanned);
  if (!result.ok) return jsonError(result.error, result.status);
  return jsonOk(result.data);
}

export async function DELETE(_req: Request, { params }: Params) {
  const auth = await requireSuperAdmin();
  if ("status" in auth) return jsonError(auth.message, auth.status);

  const { id } = await params;
  if (id === auth.userId) return jsonError("Cannot delete your own account", 403);

  const prisma = getPrisma();
  if (!prisma) return jsonError("Database not configured", 503);

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });
  if (!target) return jsonError("User not found", 404);
  if (target.role === "SUPER_ADMIN") return jsonError("Cannot delete a SUPER_ADMIN user", 403);

  await prisma.user.delete({ where: { id } });
  return jsonOk({ deleted: true });
}
