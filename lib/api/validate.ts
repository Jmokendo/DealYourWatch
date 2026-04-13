import type { Condition, CreateListingBody } from "@/lib/api/contracts";

const CONDITIONS: Condition[] = [
  "NEW",
  "MINT",
  "EXCELLENT",
  "GOOD",
  "FAIR",
];

export function parseCreateListingBody(
  raw: unknown,
): { ok: true; body: CreateListingBody } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "Invalid JSON body" };
  }
  const o = raw as Record<string, unknown>;
  const title = typeof o.title === "string" ? o.title.trim() : "";
  const userEmail = typeof o.userEmail === "string" ? o.userEmail.trim() : "";
  const price =
    typeof o.price === "number" ? o.price : Number.parseFloat(String(o.price));

  if (!title) return { ok: false, error: "title is required" };
  if (!userEmail) return { ok: false, error: "userEmail is required" };
  if (!Number.isFinite(price) || price <= 0) {
    return { ok: false, error: "price must be a positive number" };
  }

  let condition: Condition | undefined;
  if (o.condition !== undefined) {
    if (typeof o.condition !== "string" || !CONDITIONS.includes(o.condition as Condition)) {
      return { ok: false, error: "invalid condition" };
    }
    condition = o.condition as Condition;
  }

  return {
    ok: true,
    body: {
      title,
      price,
      userEmail,
      userName: typeof o.userName === "string" ? o.userName : undefined,
      imageUrl: typeof o.imageUrl === "string" ? o.imageUrl : undefined,
      description: typeof o.description === "string" ? o.description : undefined,
      modelId: typeof o.modelId === "string" ? o.modelId : undefined,
      condition,
      currency: typeof o.currency === "string" ? o.currency : undefined,
      hasBox: typeof o.hasBox === "boolean" ? o.hasBox : undefined,
      hasPapers: typeof o.hasPapers === "boolean" ? o.hasPapers : undefined,
    },
  };
}
