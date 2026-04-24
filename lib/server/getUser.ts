import "server-only";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "@/lib/server/jwt-secret";

export async function getUserIdFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    return (decoded as { userId?: string }).userId ?? null;
  } catch {
    return null;
  }
}
