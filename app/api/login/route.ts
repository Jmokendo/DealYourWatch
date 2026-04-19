export const runtime = "nodejs";

import { cookies } from "next/headers";
import { getPrisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api/http";
import { signToken, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const o = raw as Record<string, unknown>;
  const email = typeof o.email === "string" ? o.email.trim().toLowerCase() : "";
  const password = typeof o.password === "string" ? o.password : "";

  if (!email) return jsonError("email is required", 400);
  if (!password) return jsonError("password is required", 400);

  try {
    const db = getPrisma();
    if (!db) return jsonError("Database not configured", 503);

    const user = await db.user.findUnique({ where: { email } });
    if (!user) return jsonError("Invalid email or password", 401);
    if (!user.password) return jsonError("Password login is not enabled for this user", 400);
    if (user.isBanned) return jsonError("User is banned", 403);

    const ok = await verifyPassword(password, user.password);
    if (!ok) return jsonError("Invalid email or password", 401);

    const token = signToken(user.id, user.role);

    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return jsonOk({ ok: true });
  } catch (error) {
    console.error("Login error:", error);
    return jsonError("Internal server error", 500);
  }
}

