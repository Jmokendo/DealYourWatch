export const runtime = "nodejs";

import { getPrisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api/http";
import { hashPassword } from "@/lib/auth";

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
  if (!password || password.length < 8) {
    return jsonError("password must be at least 8 characters", 400);
  }

  try {
    const db = getPrisma();
    if (!db) return jsonError("Database not configured", 503);

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return jsonError("User already exists", 409);

    const hashed = await hashPassword(password);

    await db.user.create({
      data: {
        email,
        password: hashed,
        role: "USER",
      },
    });

    return jsonOk({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return jsonError("Internal server error", 500);
  }
}

