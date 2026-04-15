import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import type { Session } from "next-auth";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

function toAuthUser(session: Session | null): AuthUser | null {
  const id = session?.user?.id;
  const email = session?.user?.email?.trim();
  if (!id || !email) return null;
  return {
    id,
    email,
    name: session.user.name ?? null,
    image: session.user.image ?? null,
  };
}

/**
 * NextAuth v5: `auth()` replaces `getServerSession` for App Router.
 * Returns null when there is no session (caller should respond with 401).
 */
export async function getServerSession() {
  return auth();
}

/** Resolved user for API routes; requires both id and email. */
export async function requireAuthUser(): Promise<AuthUser | null> {
  const session = await auth();
  return toAuthUser(session);
}

/** Like requireAuthUser but also verifies the user has the ADMIN role. */
export async function requireAdminUser(): Promise<AuthUser | null> {
  const user = await requireAuthUser();
  if (!user) return null;

  const db = getPrisma();
  if (!db) return null;

  const row = await db.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (row?.role !== "ADMIN") return null;
  return user;
}
