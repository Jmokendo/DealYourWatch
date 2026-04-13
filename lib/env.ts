/**
 * USE_API_MOCK=1 — force JSON mocks (Design / Frontend unblocked without Postgres).
 * If DATABASE_URL is unset, mocks are used automatically (same as mock mode).
 */
export function isApiMockMode(): boolean {
  const explicit = process.env.USE_API_MOCK;
  if (explicit === "1" || explicit === "true") return true;
  if (!process.env.DATABASE_URL?.trim()) return true;
  return false;
}
