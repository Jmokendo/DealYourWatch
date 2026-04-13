import { isApiMockMode } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api/http";
import type { WatchModelSummary } from "@/lib/api/contracts";

const mockBySlug: Record<string, WatchModelSummary[]> = {
  rolex: [
    {
      id: "mock-model-1",
      name: "Submariner Date",
      slug: "submariner-date",
      reference: "126610LN",
      brand: { id: "mock-brand-1", name: "Rolex", slug: "rolex" },
    },
  ],
  omega: [
    {
      id: "mock-model-2",
      name: "Speedmaster Moonwatch",
      slug: "speedmaster-moonwatch",
      reference: null,
      brand: { id: "mock-brand-2", name: "Omega", slug: "omega" },
    },
  ],
  other: [
    {
      id: "mock-model-fallback",
      name: "Unspecified",
      slug: "unspecified",
      reference: null,
      brand: { id: "mock-brand-other", name: "Other", slug: "other" },
    },
  ],
};

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;

  if (isApiMockMode()) {
    const list = mockBySlug[slug] ?? null;
    if (!list) return jsonError("Brand not found", 404);
    return jsonOk([...list]);
  }

  const db = getPrisma();
  if (!db) {
    const list = mockBySlug[slug] ?? null;
    if (!list) return jsonError("Brand not found", 404);
    return jsonOk([...list]);
  }

  const brand = await db.brand.findUnique({ where: { slug } });
  if (!brand) return jsonError("Brand not found", 404);

  const rows = await db.watchModel.findMany({
    where: { brandId: brand.id },
    orderBy: { name: "asc" },
    include: { brand: true },
  });

  return jsonOk(
    rows.map((m) => ({
      id: m.id,
      name: m.name,
      slug: m.slug,
      reference: m.reference,
      brand: {
        id: m.brand.id,
        name: m.brand.name,
        slug: m.brand.slug,
      },
    })),
  );
}
