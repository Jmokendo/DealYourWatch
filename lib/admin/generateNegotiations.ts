import type { PrismaClient } from "@prisma/client";
import { DEMO_BUYER_EMAILS, DEMO_SELLER_EMAILS } from "./generateUsers";

const TARGET_COUNT = 10;
const MIN_OFFERS = 2;
const MAX_OFFERS = 4;

const NEGOTIATION_STATES: Array<[string, number]> = [
  ["ACTIVE", 0.45],
  ["ACCEPTED", 0.35],
  ["REJECTED", 0.20],
];

const OFFER_REASONS = [
  "PRICE",
  "CONDITION",
  "MARKET",
  "COMPS",
  "TIMING",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function randomInteger(min: number, max: number) {
  return Math.floor(randomBetween(min, max + 1));
}

function roundToFifty(value: number) {
  return Math.round(value / 50) * 50;
}

function randomPastDate(daysAgo: number) {
  return new Date(Date.now() - Math.round(Math.random() * daysAgo * 24 * 60 * 60 * 1000));
}

function randomDateBetween(start: Date, end: Date) {
  return new Date(start.getTime() + Math.round(Math.random() * (end.getTime() - start.getTime())));
}

function pickWeighted<T>(items: Array<[T, number]>): T {
  const total = items.reduce((sum, [, weight]) => sum + weight, 0);
  const value = Math.random() * total;
  let accumulator = 0;

  for (const [item, weight] of items) {
    accumulator += weight;
    if (value <= accumulator) return item;
  }

  return items[items.length - 1][0];
}

function buildOfferSequence(listingPrice: number, count: number, negotiationStatus: string) {
  const first = roundToFifty(listingPrice * randomBetween(0.6, 0.8));
  const offers: number[] = [first];

  for (let i = 1; i < count; i++) {
    const previous = offers[i - 1];
    const step = listingPrice * randomBetween(0.05, 0.12);
    const next = roundToFifty(Math.min(listingPrice * 1.02, previous + step));
    offers.push(next);
  }

  if (negotiationStatus === "ACCEPTED") {
    offers[count - 1] = roundToFifty(Math.max(offers[count - 1], listingPrice * randomBetween(0.9, 1.0)));
  } else if (negotiationStatus === "REJECTED") {
    offers[count - 1] = roundToFifty(Math.min(offers[count - 1], listingPrice * randomBetween(0.62, 0.75)));
  } else {
    offers[count - 1] = roundToFifty(Math.min(offers[count - 1], listingPrice * randomBetween(0.78, 0.92)));
  }

  return offers;
}

export type GenerateNegotiationsResult = {
  created: number;
  skipped: number;
  total: number;
};

export async function generateNegotiations(
  db: PrismaClient,
): Promise<GenerateNegotiationsResult> {
  const buyers = await db.user.findMany({
    where: { email: { in: DEMO_BUYER_EMAILS } },
    select: { id: true },
  });

  const sellers = await db.user.findMany({
    where: { email: { in: DEMO_SELLER_EMAILS } },
    select: { id: true },
  });

  if (buyers.length === 0 || sellers.length === 0) {
    throw new Error("No demo users found — run generate-users first.");
  }

  const sellerIds = sellers.map((seller) => seller.id);
  const buyerIds = buyers.map((buyer) => buyer.id);

  const activeListings = await db.listing.findMany({
    where: {
      userId: { in: sellerIds },
      status: { in: ["AVAILABLE", "RESERVED", "APPROVED"] },
    },
    select: { id: true, price: true, userId: true, createdAt: true, status: true },
  });

  if (activeListings.length === 0) {
    throw new Error("No active demo listings found — run generate-listings first.");
  }

  const existing = await db.negotiation.count({
    where: { buyerId: { in: buyerIds } },
  });

  if (existing >= TARGET_COUNT) {
    return { created: 0, skipped: existing, total: existing };
  }

  const toCreate = TARGET_COUNT - existing;
  let created = 0;

  for (let i = 0; i < toCreate; i++) {
    const negotiationStatus = pickWeighted(NEGOTIATION_STATES);
    const candidateListings = activeListings.filter((listing) => {
      const buyerCandidates = buyers.filter((buyer) => buyer.id !== listing.userId);
      return buyerCandidates.length > 0;
    });

    if (candidateListings.length === 0) {
      break;
    }

    const listing = pick(candidateListings);
    const eligibleBuyers = buyers.filter((buyer) => buyer.id !== listing.userId);
    if (eligibleBuyers.length === 0) continue;

    const buyer = pick(eligibleBuyers);
    const offerCount = randomInteger(MIN_OFFERS, MAX_OFFERS);
    const offerAmounts = buildOfferSequence(listing.price, offerCount, negotiationStatus);
    const negotiationCreatedAt = randomPastDate(7);
    const expiresAt = new Date(negotiationCreatedAt.getTime() + randomInteger(2, 7) * 24 * 60 * 60 * 1000);

    const offerRecords = offerAmounts.map((amount, index) => {
      const isBuyerOffer = index % 2 === 0;
      const offerTime = randomDateBetween(
        new Date(negotiationCreatedAt.getTime() + index * 60 * 60 * 1000),
        new Date(negotiationCreatedAt.getTime() + (index + 1) * 60 * 60 * 1000),
      );
      const status = index === offerAmounts.length - 1
        ? negotiationStatus === "ACTIVE"
          ? "PENDING"
          : negotiationStatus === "ACCEPTED"
          ? "ACCEPTED"
          : "REJECTED"
        : "COUNTERED";

      return {
        userId: isBuyerOffer ? buyer.id : listing.userId,
        amount,
        currency: "USD",
        reasonType: pick(OFFER_REASONS),
        reasonNote:
          index === 0
            ? "Opening offer based on recent comps."
            : index === offerAmounts.length - 1 && negotiationStatus === "REJECTED"
            ? "Unable to agree on price."
            : index === offerAmounts.length - 1 && negotiationStatus === "ACCEPTED"
            ? "Accepting final terms."
            : undefined,
        status,
        createdAt: offerTime,
      };
    });

    const negotiation = await db.negotiation.create({
      data: {
        listingId: listing.id,
        buyerId: buyer.id,
        status: negotiationStatus,
        round: offerCount,
        expiresAt,
        createdAt: negotiationCreatedAt,
        offers: {
          create: offerRecords,
        },
      },
    });

    if (negotiationStatus === "ACCEPTED") {
      const finalOfferTime = offerRecords[offerRecords.length - 1].createdAt;
      await db.listing.update({
        where: { id: listing.id },
        data: {
          status: "SOLD",
          soldAt: finalOfferTime,
        },
      });
    } else if (negotiationStatus === "ACTIVE" && listing.status !== "RESERVED") {
      await db.listing.update({
        where: { id: listing.id },
        data: { status: "RESERVED" },
      });
    }

    created++;
  }

  return { created, skipped: existing, total: existing + created };
}
