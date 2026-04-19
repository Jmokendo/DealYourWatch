import type { PrismaClient } from "@prisma/client";
import { DEMO_SELLER_EMAILS } from "./generateUsers";

const TARGET_COUNT = 20;

const CONDITIONS = ["NEW", "LIKE_NEW", "LIKE_NEW", "USED", "USED"] as const;
const LISTING_STATUSES = [
  "AVAILABLE",
  "AVAILABLE",
  "AVAILABLE",
  "AVAILABLE",
  "AVAILABLE",
  "AVAILABLE",
  "RESERVED",
  "RESERVED",
  "RESERVED",
  "SOLD",
  "SOLD",
  "SOLD",
] as const;

const DESCRIPTION_SNIPPETS = [
  "Worn only a handful of times. Comes complete with full set.",
  "Single owner, excellent condition. Serviced last year.",
  "Purchased in 2023. No scratches, pristine dial.",
  "Rarely worn investment piece. Original bracelet and extra links.",
  "Box and papers intact. Runs perfectly, no issues.",
  "Bought at authorised dealer. Collector's piece in superb shape.",
  "Like new — stored safely since purchase. Full set available.",
  "Well maintained with all original parts. Strong wrist presence.",
  "Sold with original box and papers. Ready for immediate transfer.",
  "Carefully sourced, freshly serviced and guaranteed authentic.",
];

const BRAND_TIERS: Record<string, "entry" | "mid" | "high"> = {
  rolex: "high",
  omega: "mid",
  "patek philippe": "high",
  patek: "high",
  "audemars piguet": "high",
  ap: "high",
  breitling: "mid",
  tudor: "entry",
  cartier: "mid",
  iwc: "mid",
  "tag heuer": "entry",
  jaeger: "high",
  panerai: "mid",
  hublot: "high",
};

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function roundToHundreds(value: number) {
  return Math.round(value / 100) * 100;
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function randomDateBetween(start: Date, end: Date) {
  return new Date(start.getTime() + Math.round(Math.random() * (end.getTime() - start.getTime())));
}

function randomDateInPast(days: number) {
  return new Date(Date.now() - Math.round(Math.random() * days * 24 * 60 * 60 * 1000));
}

function getPriceForBrand(brand: string) {
  const normalized = brand.toLowerCase();
  const tier = BRAND_TIERS[normalized] ?? (Math.random() > 0.5 ? "mid" : "high");

  if (tier === "entry") return roundToHundreds(randomBetween(2000, 5000));
  if (tier === "mid") return roundToHundreds(randomBetween(5200, 12000));
  return roundToHundreds(randomBetween(12000, 40000));
}

export type GenerateListingsResult = {
  created: number;
  skipped: number;
  total: number;
};

export async function generateListings(db: PrismaClient): Promise<GenerateListingsResult> {
  const sellers = await db.user.findMany({
    where: { email: { in: DEMO_SELLER_EMAILS } },
    select: { id: true },
  });

  if (sellers.length === 0) {
    throw new Error("No demo sellers found — run generate-users first.");
  }

  const models = await db.watchModel.findMany({ include: { brand: true } });

  if (models.length === 0) {
    throw new Error("No watch models found in database. Run the seed script.");
  }

  const existing = await db.listing.count({
    where: { userId: { in: sellers.map((seller) => seller.id) } },
  });

  if (existing >= TARGET_COUNT) {
    return { created: 0, skipped: existing, total: existing };
  }

  const toCreate = TARGET_COUNT - existing;
  let created = 0;

  for (let i = 0; i < toCreate; i++) {
    const model = pick(models);
    const seller = pick(sellers);
    const condition = pick(CONDITIONS);
    const listingStatus = pick(LISTING_STATUSES);
    const hasBox = Math.random() > 0.3;
    const hasPapers = Math.random() > 0.4;
    const price = getPriceForBrand(model.brand.name);
    const createdAt = randomDateInPast(30);
    const soldAt =
      listingStatus === "SOLD"
        ? randomDateBetween(createdAt, new Date())
        : undefined;

    await db.listing.create({
      data: {
        title: `${model.brand.name} ${model.name}${model.reference ? ` (${model.reference})` : ""}`,
        description: pick(DESCRIPTION_SNIPPETS),
        price,
        currency: "USD",
        condition,
        hasBox,
        hasPapers,
        status: listingStatus,
        soldAt,
        createdAt,
        userId: seller.id,
        modelId: model.id,
      },
    });

    created++;
  }

  return { created, skipped: existing, total: existing + created };
}
