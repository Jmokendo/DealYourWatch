import "server-only";

export function getJwtSecret(): string {
  const secret =
    process.env.JWT_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim();

  if (!secret) {
    throw new Error("JWT_SECRET is required for auth. Configure JWT_SECRET, AUTH_SECRET, or NEXTAUTH_SECRET.");
  }

  return secret;
}
