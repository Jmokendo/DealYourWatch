// ADMIN: remove auth bypass before production
import { getPrisma } from "@/lib/prisma";
import { ok, created, badRequest, serverError, requireFields } from "@/lib/api";

// ---------------------------------------------------------------------------
// GET /api/admin/users — list all users with listings + offers counts
// ---------------------------------------------------------------------------
export async function GET() {
  const db = getPrisma();
  if (!db) return serverError("Database not configured");

  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { listings: true, offers: true },
        },
      },
    });

    return ok(
      users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt.toISOString(),
        listingsCount: u._count.listings,
        offersCount: u._count.offers,
      })),
    );
  } catch (e) {
    return serverError(e);
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/users — create a user manually for testing
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  const db = getPrisma();
  if (!db) return serverError("Database not configured");

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return badRequest("JSON inválido");
  }
  const body = raw as Record<string, unknown>;

  const missing = requireFields(body, ["name", "email"]);
  if (missing) return badRequest(missing);

  const name = String(body.name).trim();
  const email = String(body.email).trim().toLowerCase();
  const role =
    body.role === "ADMIN" ? ("ADMIN" as const) : ("USER" as const);

  if (!email.includes("@")) return badRequest("Email inválido");

  try {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return badRequest("Ya existe un usuario con ese email");
    }

    const user = await db.user.create({
      data: { name, email, role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return created({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (e) {
    return serverError(e);
  }
}
