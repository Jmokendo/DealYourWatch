import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getPrisma } from "@/lib/prisma";

const prisma = getPrisma();

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: prisma ? PrismaAdapter(prisma) : undefined,
  session: prisma
    ? { strategy: "database", maxAge: 30 * 24 * 60 * 60 }
    : { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
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
