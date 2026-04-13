import type { PrismaClient } from "@prisma/client";

/**
 * MVP: form does not require model pick — attach listings to a synthetic "Other / Unspecified" row.
 * Replace with explicit catalog UX later; keep modelId on Listing as the stable FK.
 */
export async function ensureFallbackWatchModelId(
  db: PrismaClient,
): Promise<string> {
  const brand = await db.brand.upsert({
    where: { slug: "other" },
    create: { name: "Other", slug: "other" },
    update: {},
  });
  const model = await db.watchModel.upsert({
    where: {
      brandId_slug: { brandId: brand.id, slug: "unspecified" },
    },
    create: {
      brandId: brand.id,
      name: "Unspecified",
      slug: "unspecified",
      reference: null,
    },
    update: {},
  });
  return model.id;
}
