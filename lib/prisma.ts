import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function buildClient() {
  const url = process.env.DATABASE_URL?.trim();
  console.log("DATABASE_URL configured:", Boolean(url));
  if (!url) {
    throw new Error("DATABASE_URL is required for Prisma. Configure a PostgreSQL connection string.");
  }

  return new PrismaClient({
    log: ["error"],
    datasources: { db: { url } },
  });
}

export const prisma = globalForPrisma.prisma ?? buildClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export function getPrisma(): PrismaClient {
  return prisma;
}
