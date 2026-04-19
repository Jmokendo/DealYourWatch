import type { PrismaClient } from "@prisma/client";
import { generateUsers, type GenerateUsersResult } from "./generateUsers";
import { generateListings, type GenerateListingsResult } from "./generateListings";
import { generateNegotiations, type GenerateNegotiationsResult } from "./generateNegotiations";

export type DemoDataSummary = {
  users: GenerateUsersResult;
  listings: GenerateListingsResult;
  negotiations: GenerateNegotiationsResult;
};

export async function generateDemoData(db: PrismaClient): Promise<DemoDataSummary> {
  const users = await generateUsers(db);
  const listings = await generateListings(db);
  const negotiations = await generateNegotiations(db);
  return { users, listings, negotiations };
}
