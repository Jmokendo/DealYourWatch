import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Returns null when no DATABASE_URL (callers should use API mocks instead). */
export function getPrisma(): PrismaClient | null {
  const hasUrl = !!process.env.DATABASE_URL?.trim();
  console.log("Using DATABASE_URL:", hasUrl);
  if (!hasUrl) return null;
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      datasources: { db: { url: process.env.DATABASE_URL } },
    });
  }
  return globalForPrisma.prisma;
}
