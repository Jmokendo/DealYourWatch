// ADMIN: remove auth bypass before production
import { getPrisma } from "@/lib/prisma";
import { ok, badRequest, serverError } from "@/lib/api";
import { Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// POST /api/admin/seed
// Generates a complete test scenario in one call.
// Body: { reset?: boolean } — if true, wipe and reseed
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  const db = getPrisma();
  if (!db) return serverError("Database not configured");

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    raw = {};
  }
  const body = raw as Record<string, unknown>;
  const reset = body.reset === true;

  try {
    if (reset) {
      console.log("[ADMIN SEED] Wiping database for reseed...");
      // Delete in reverse dependency order
      await db.$transaction([
        db.message.deleteMany(),
        db.thread.deleteMany(),
        db.offer.deleteMany(),
        db.negotiation.deleteMany(),
        db.sale.deleteMany(),
        db.listingImage.deleteMany(),
        db.valuation.deleteMany(),
        db.listing.deleteMany(),
        db.watchModel.deleteMany(),
        db.brand.deleteMany(),
        db.session.deleteMany(),
        db.account.deleteMany(),
        db.user.deleteMany(),
      ]);
      console.log("[ADMIN SEED] Wipe complete.");
    }

    // -----------------------------------------------------------------------
    // Brands + models
    // -----------------------------------------------------------------------
    const [rolex, omega, tissot] = await Promise.all([
      db.brand.upsert({
        where: { slug: "rolex" },
        create: { name: "Rolex", slug: "rolex" },
        update: {},
      }),
      db.brand.upsert({
        where: { slug: "omega" },
        create: { name: "Omega", slug: "omega" },
        update: {},
      }),
      db.brand.upsert({
        where: { slug: "tissot" },
        create: { name: "Tissot", slug: "tissot" },
        update: {},
      }),
    ]);

    const [submariner, seamaster, prx] = await Promise.all([
      db.watchModel.upsert({
        where: { brandId_slug: { brandId: rolex.id, slug: "submariner" } },
        create: { brandId: rolex.id, name: "Submariner", slug: "submariner", reference: "124060" },
        update: {},
      }),
      db.watchModel.upsert({
        where: { brandId_slug: { brandId: omega.id, slug: "seamaster" } },
        create: { brandId: omega.id, name: "Seamaster", slug: "seamaster", reference: "210.30.42" },
        update: {},
      }),
      db.watchModel.upsert({
        where: { brandId_slug: { brandId: tissot.id, slug: "prx" } },
        create: { brandId: tissot.id, name: "PRX", slug: "prx", reference: "T137.410" },
        update: {},
      }),
    ]);

    // -----------------------------------------------------------------------
    // Users: 3 sellers + 3 buyers
    // -----------------------------------------------------------------------
    const ts = Date.now();
    const mkEmail = (prefix: string) => `${prefix}.seed${ts}@dealyourwatch.test`;

    const [s1, s2, s3, b1, b2, b3] = await Promise.all([
      db.user.create({ data: { name: "Seller Alpha", email: mkEmail("seller-alpha") } }),
      db.user.create({ data: { name: "Seller Beta", email: mkEmail("seller-beta") } }),
      db.user.create({ data: { name: "Seller Gamma", email: mkEmail("seller-gamma") } }),
      db.user.create({ data: { name: "Buyer Alpha", email: mkEmail("buyer-alpha") } }),
      db.user.create({ data: { name: "Buyer Beta", email: mkEmail("buyer-beta") } }),
      db.user.create({ data: { name: "Buyer Gamma", email: mkEmail("buyer-gamma") } }),
    ]);

    // -----------------------------------------------------------------------
    // Listings: 8 across brands (mix of ACTIVE, PAUSED, SOLD)
    // -----------------------------------------------------------------------
    const expiresAt = new Date(Date.now() + 7 * 864e5);

    const [l1, l2, l3, l4, l5, l6, l7, l8] = await db.$transaction([
      db.listing.create({ data: { userId: s1.id, modelId: submariner.id, title: "Rolex Submariner impecable", price: new Prisma.Decimal(12000), currency: "USD", condition: "MINT", status: "ACTIVE" } }),
      db.listing.create({ data: { userId: s1.id, modelId: seamaster.id, title: "Omega Seamaster en caja", price: new Prisma.Decimal(5500), currency: "USD", condition: "EXCELLENT", status: "ACTIVE", hasBox: true } }),
      db.listing.create({ data: { userId: s2.id, modelId: prx.id, title: "Tissot PRX cuarzo", price: new Prisma.Decimal(650), currency: "USD", condition: "GOOD", status: "ACTIVE" } }),
      db.listing.create({ data: { userId: s2.id, modelId: submariner.id, title: "Submariner date 2022", price: new Prisma.Decimal(14500), currency: "USD", condition: "MINT", status: "PAUSED", year: 2022 } }),
      db.listing.create({ data: { userId: s3.id, modelId: seamaster.id, title: "Seamaster Planet Ocean", price: new Prisma.Decimal(7200), currency: "USD", condition: "EXCELLENT", status: "ACTIVE" } }),
      db.listing.create({ data: { userId: s3.id, modelId: prx.id, title: "Tissot PRX automático", price: new Prisma.Decimal(900), currency: "USD", condition: "NEW", status: "ACTIVE" } }),
      db.listing.create({ data: { userId: s1.id, modelId: submariner.id, title: "Rolex Submariner vintage", price: new Prisma.Decimal(18000), currency: "USD", condition: "GOOD", status: "SOLD", soldAt: new Date() } }),
      db.listing.create({ data: { userId: s2.id, modelId: seamaster.id, title: "Omega Constellation", price: new Prisma.Decimal(3200), currency: "USD", condition: "FAIR", status: "PAUSED" } }),
    ]);

    // -----------------------------------------------------------------------
    // Negotiations + offers
    // -----------------------------------------------------------------------

    // Negotiation 1: b1 ↔ s1 on l1 — 2 offers, PENDING (in progress)
    const neg1 = await db.negotiation.create({
      data: { listingId: l1.id, buyerId: b1.id, expiresAt },
    });
    await db.thread.create({ data: { negotiationId: neg1.id, buyerId: b1.id } });
    await db.offer.create({ data: { negotiationId: neg1.id, userId: b1.id, amount: 10000, currency: "USD", reasonType: "OFFER", status: "COUNTERED" } });
    await db.offer.create({ data: { negotiationId: neg1.id, userId: s1.id, amount: 11500, currency: "USD", reasonType: "COUNTER", status: "PENDING" } });

    // Negotiation 2: b2 ↔ s1 on l2 — 1 offer, PENDING
    const neg2 = await db.negotiation.create({
      data: { listingId: l2.id, buyerId: b2.id, expiresAt },
    });
    await db.thread.create({ data: { negotiationId: neg2.id, buyerId: b2.id } });
    await db.offer.create({ data: { negotiationId: neg2.id, userId: b2.id, amount: 5000, currency: "USD", reasonType: "OFFER", status: "PENDING" } });

    // Negotiation 3: b3 ↔ s3 on l5 — 1 offer REJECTED
    const neg3 = await db.negotiation.create({
      data: { listingId: l5.id, buyerId: b3.id, expiresAt, status: "REJECTED" },
    });
    await db.thread.create({ data: { negotiationId: neg3.id, buyerId: b3.id } });
    await db.offer.create({ data: { negotiationId: neg3.id, userId: b3.id, amount: 6000, currency: "USD", reasonType: "OFFER", status: "REJECTED" } });

    // Negotiation 4 (completed sale): b1 ↔ s1 on l7 — ACCEPTED
    const neg4 = await db.negotiation.create({
      data: { listingId: l7.id, buyerId: b1.id, expiresAt, status: "ACCEPTED" },
    });
    await db.thread.create({ data: { negotiationId: neg4.id, buyerId: b1.id } });
    await db.offer.create({ data: { negotiationId: neg4.id, userId: b1.id, amount: 17500, currency: "USD", reasonType: "OFFER", status: "ACCEPTED" } });

    // Sale record for completed negotiation
    await db.sale.upsert({
      where: { listingId: l7.id },
      create: { listingId: l7.id, sellerId: s1.id, buyerId: b1.id, finalPrice: new Prisma.Decimal(17500), currency: "USD" },
      update: {},
    });

    console.log("[ADMIN SEED] Seed complete.");

    return ok({
      users: { sellers: [s1.id, s2.id, s3.id], buyers: [b1.id, b2.id, b3.id] },
      listings: [l1.id, l2.id, l3.id, l4.id, l5.id, l6.id, l7.id, l8.id],
      negotiations: [neg1.id, neg2.id, neg3.id, neg4.id],
      offers: { inProgress: 3, completed: 1 },
    });
  } catch (e) {
    return serverError(e);
  }
}
