import { isApiMockMode } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api/http";
import { mockListings } from "@/lib/api/mock-data";
import { parseCreateListingBody } from "@/lib/api/validate";
import { ensureFallbackWatchModelId } from "@/lib/api/catalog";
import { toListingSummary } from "@/lib/api/serialize-listing";
import type { ListingStatus, ListingSummary } from "@/lib/api/contracts";

const listInclude = {
  images: { orderBy: { order: "asc" as const } },
  model: { include: { brand: true } },
  user: true,
} as const;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as ListingStatus | null;

  if (isApiMockMode()) {
    let data: ListingSummary[] = [...mockListings];
    if (status) data = data.filter((l) => l.status === status);
    return jsonOk(data);
  }

  const db = getPrisma();
  if (!db) return jsonOk([...mockListings]);

  const rows = await db.listing.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: listInclude,
  });

  return jsonOk(rows.map((r) => toListingSummary(r)));
}

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = parseCreateListingBody(raw);
  if (!parsed.ok) return jsonError(parsed.error, 400);

  const b = parsed.body;

  if (isApiMockMode()) {
    const now = new Date().toISOString();
    const created: ListingSummary = {
      id: `mock-${Date.now()}`,
      title: b.title,
      description: b.description ?? null,
      price: b.price.toFixed(2),
      currency: b.currency ?? "USD",
      condition: b.condition ?? "EXCELLENT",
      hasBox: b.hasBox ?? false,
      hasPapers: b.hasPapers ?? false,
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
      images: b.imageUrl
        ? [
            {
              id: `img-${Date.now()}`,
              url: b.imageUrl,
              order: 0,
            },
          ]
        : [],
      model: {
        id: "mock-model-fallback",
        name: "Unspecified",
        slug: "unspecified",
        reference: null,
        brand: { id: "mock-brand-other", name: "Other", slug: "other" },
      },
      user: {
        id: `mock-user-${b.userEmail}`,
        email: b.userEmail,
        name: b.userName ?? null,
        image: null,
      },
    };
    mockListings.unshift(created);
    return jsonOk(created, { status: 201 });
  }

  const db = getPrisma();
  if (!db) {
    return jsonError("Database not configured", 503);
  }

  const modelId = b.modelId ?? (await ensureFallbackWatchModelId(db));

  if (b.modelId) {
    const exists = await db.watchModel.findUnique({ where: { id: b.modelId } });
    if (!exists) return jsonError("modelId not found", 400);
  }

  const user = await db.user.upsert({
    where: { email: b.userEmail },
    create: {
      email: b.userEmail,
      name: b.userName ?? null,
    },
    update: { name: b.userName ?? undefined },
  });

  const listing = await db.listing.create({
    data: {
      userId: user.id,
      modelId,
      title: b.title,
      description: b.description,
      price: b.price,
      currency: b.currency ?? "USD",
      condition: b.condition ?? "EXCELLENT",
      hasBox: b.hasBox ?? false,
      hasPapers: b.hasPapers ?? false,
      status: "PENDING",
      images: b.imageUrl
        ? {
            create: [{ url: b.imageUrl, order: 0 }],
          }
        : undefined,
    },
    include: listInclude,
  });

  return jsonOk(toListingSummary(listing), { status: 201 });
}
