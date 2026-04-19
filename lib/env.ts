/**
 * USE_API_MOCK=1 — force JSON mocks (Design / Frontend unblocked without Postgres).
 */
export function isApiMockMode(): boolean {
  const explicit = process.env.USE_API_MOCK;
  if (explicit === "1" || explicit === "true") return true;
  return false;
}
