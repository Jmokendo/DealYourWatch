import { getUserIdFromCookie } from "@/lib/getUser";
import { getPrisma } from "@/lib/prisma";

type AdminAuthResult =
  | { userId: string }
  | { status: 401 | 403 | 503; message: string };

export async function requireSuperAdmin(): Promise<AdminAuthResult> {
  const userId = await getUserIdFromCookie();
  if (!userId) return { status: 401, message: "Unauthorized" };

  const prisma = getPrisma();
  if (!prisma) return { status: 503, message: "Service unavailable" };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, isBanned: true },
  });

  if (!user) return { status: 401, message: "Unauthorized" };
  if (user.isBanned) return { status: 403, message: "Forbidden" };
  if (user.role !== "SUPER_ADMIN") return { status: 403, message: "Forbidden" };

  return { userId: user.id };
}

export async function requireAdmin(): Promise<string | null> {
  const userId = await getUserIdFromCookie();
  if (!userId) return null;

  const prisma = getPrisma();
  if (!prisma) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, isBanned: true },
  });

  if (!user || user.isBanned) return null;
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") return null;

  return user.id;
}
