import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { createDevSession, DEV_USER } from "@/lib/devUser";
import type { Session } from "next-auth";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

const isDevAuthBypass = process.env.NODE_ENV !== "production";

async function resolveDevUser(): Promise<AuthUser> {
  const db = getPrisma();
  if (!db) {
    return {
      id: DEV_USER.id,
      email: DEV_USER.email,
      name: DEV_USER.name,
      image: null,
    };
  }

  const user = await db.user.upsert({
    where: { email: DEV_USER.email },
    update: { name: DEV_USER.name },
    create: {
      id: DEV_USER.id,
      email: DEV_USER.email,
      name: DEV_USER.name,
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name ?? DEV_USER.name,
    image: user.image ?? null,
  };
}

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
  if (isDevAuthBypass) {
    const user = await resolveDevUser();
    return createDevSession(user.id);
  }
  return auth();
}

/** Resolved user for API routes; requires both id and email. */
export async function requireAuthUser(): Promise<AuthUser | null> {
  if (isDevAuthBypass) {
    return resolveDevUser();
  }
  const session = await auth();
  return toAuthUser(session);
}
