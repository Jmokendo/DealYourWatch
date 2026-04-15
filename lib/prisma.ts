import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** Returns null when no DATABASE_URL (callers should use API mocks instead). */
export function getPrisma(): PrismaClient | null {
  if (!process.env.DATABASE_URL?.trim()) return null;
  return prisma;
}
