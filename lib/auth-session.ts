import { auth } from "@/auth";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

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
