import "server-only";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getJwtSecret } from "@/lib/server/jwt-secret";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(userId: string, role = "USER") {
  return jwt.sign({ userId, role }, getJwtSecret(), { expiresIn: "7d" });
}

export async function auth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId?: string; role?: string };
    if (!decoded || typeof decoded.userId !== "string") return null;
    return { user: { id: decoded.userId, role: decoded.role ?? "USER" } };
  } catch {
    return null;
  }
}
