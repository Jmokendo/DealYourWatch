export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { generateDemoData } from "@/lib/admin/generateDemoData";

export async function POST() {
  const auth = await requireSuperAdmin();
  if ("status" in auth) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const db = getPrisma();
  if (!db) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });

  try {
    const result = await generateDemoData(db);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
