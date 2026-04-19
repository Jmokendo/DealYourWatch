import * as bcrypt from "bcryptjs";
import type { PrismaClient } from "@prisma/client";

const DEMO_PASSWORD = "demo-password123";

const DEMO_SELLERS = [
  { email: "demo-seller1@test.com", name: "Noah Bennett" },
  { email: "demo-seller2@test.com", name: "Mia Laurent" },
  { email: "demo-seller3@test.com", name: "Luca Romano" },
  { email: "demo-seller4@test.com", name: "Avery Collins" },
];

const DEMO_BUYERS = [
  { email: "demo-buyer1@test.com", name: "Olivia Carter" },
  { email: "demo-buyer2@test.com", name: "Ethan Brooks" },
  { email: "demo-buyer3@test.com", name: "Isabella Nguyen" },
  { email: "demo-buyer4@test.com", name: "Noah Patel" },
  { email: "demo-buyer5@test.com", name: "Sophia Reed" },
  { email: "demo-buyer6@test.com", name: "Mason Clarke" },
];

const DEMO_USERS = [...DEMO_SELLERS, ...DEMO_BUYERS];

function randomDateWithinDaysAgo(minDays: number, maxDays: number) {
  const now = Date.now();
  const rangeMs = (maxDays - minDays) * 24 * 60 * 60 * 1000;
  const offsetMs = minDays * 24 * 60 * 60 * 1000 + Math.round(Math.random() * rangeMs);
  return new Date(now - offsetMs);
}

export type GenerateUsersResult = {
  created: number;
  updated: number;
  total: number;
};

export async function generateUsers(db: PrismaClient): Promise<GenerateUsersResult> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  let created = 0;

  for (const data of DEMO_USERS) {
    const result = await db.user.upsert({
      where: { email: data.email },
      update: { name: data.name },
      create: {
        email: data.email,
        name: data.name,
        password: passwordHash,
        role: "USER",
        createdAt: randomDateWithinDaysAgo(30, 120),
      },
    });

    if (result.createdAt.getTime() === result.updatedAt.getTime()) {
      created++;
    }
  }

  return {
    created,
    updated: DEMO_USERS.length - created,
    total: DEMO_USERS.length,
  };
}

export const DEMO_SELLER_EMAILS = DEMO_SELLERS.map((u) => u.email);
export const DEMO_BUYER_EMAILS = DEMO_BUYERS.map((u) => u.email);
