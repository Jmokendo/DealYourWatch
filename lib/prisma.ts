import { PrismaClient } from "@prisma/client";

console.log("Using DATABASE_URL:", !!process.env.DATABASE_URL?.trim());

if (!process.env.DATABASE_URL?.trim()) {
  console.error(
    "[prisma] DATABASE_URL is not set. Database operations will fail. " +
      "Set DATABASE_URL to a valid PostgreSQL connection string."
  );
}

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
