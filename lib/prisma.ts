import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function buildClient() {
  const url = process.env.DATABASE_URL?.trim();
  console.log("Using DATABASE_URL:", !!url);
  return new PrismaClient({
    log: ["error"],
    ...(url ? { datasources: { db: { url } } } : {}),
  });
}

export const prisma = globalForPrisma.prisma ?? buildClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** Returns null when no DATABASE_URL (callers should use API mocks instead). */
export function getPrisma(): PrismaClient | null {
  if (!process.env.DATABASE_URL?.trim()) return null;
  return prisma;
}
