import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getPrisma } from "@/lib/prisma";

const prisma = getPrisma();
const authSecret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
const googleClientId =
  process.env.GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID;
const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET;
const hasGoogleProviderConfig = Boolean(
  googleClientId?.trim() && googleClientSecret?.trim(),
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  ...(authSecret ? { secret: authSecret } : {}),
  adapter: prisma ? PrismaAdapter(prisma) : undefined,
  session: prisma
    ? { strategy: "database", maxAge: 30 * 24 * 60 * 60 }
    : { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: hasGoogleProviderConfig
    ? [
        Google({
          clientId: googleClientId!,
          clientSecret: googleClientSecret!,
          allowDangerousEmailAccountLinking: true,
        }),
      ]
    : [],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, user, token }) {
      if (session.user) {
        const id = user?.id ?? token?.sub;
        if (id) session.user.id = id;
      }
      return session;
    },
  },
});
