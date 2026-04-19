import { isApiMockMode } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api/http";
import type { BrandSummary } from "@/lib/api/contracts";

const mockBrands: BrandSummary[] = [
  { id: "mock-brand-1", name: "Rolex", slug: "rolex" },
  { id: "mock-brand-2", name: "Omega", slug: "omega" },
  { id: "mock-brand-other", name: "Other", slug: "other" },
];

export async function GET() {
  if (isApiMockMode()) {
    return jsonOk([...mockBrands]);
  }

  try {
    const db = getPrisma();
    if (!db) return jsonOk([...mockBrands]);

    const rows = await db.brand.findMany({ orderBy: { name: "asc" } });
    return jsonOk(
      rows.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
      })),
    );
  } catch (error) {
    console.error("Get brands error:", error);
    return jsonError("Internal server error", 500);
  }
}
