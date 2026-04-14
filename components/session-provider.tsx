"use client";

import type { Session } from "next-auth";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <NextAuthSessionProvider
      session={session ?? undefined}
      refetchInterval={0}
      refetchOnWindowFocus={process.env.NODE_ENV === "production"}
    >
      {children}
    </NextAuthSessionProvider>
  );
}
