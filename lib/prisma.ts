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

function buildClient() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL is required for Prisma. Configure a PostgreSQL connection string.");
  }

  return new PrismaClient({
    log: ["error"],
    datasources: { db: { url } },
  });
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = buildClient();
  }

  return globalForPrisma.prisma;
}
