import { getUserIdFromCookie } from "@/lib/getUser";

const DEV_USER_ID = "dev-user-1";

/**
 * Returns the authenticated admin userId, or null if not authorized.
 * Non-production: any authenticated user (or the dev bypass) is treated as admin.
 * Production: userId must appear in the ADMIN_USER_IDS env var (comma-separated).
 */
export async function requireAdmin(): Promise<string | null> {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    const userId = await getUserIdFromCookie();
    return userId ?? DEV_USER_ID;
  }

  const userId = await getUserIdFromCookie();
  if (!userId) return null;

  const adminIds = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (adminIds.length > 0 && !adminIds.includes(userId)) return null;

  return userId;
}
