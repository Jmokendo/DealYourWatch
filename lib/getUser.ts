import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export function getUserIdFromCookie() {
  const token = cookies().get("auth_token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
    return (decoded as { userId?: string }).userId ?? null;
  } catch {
    return null;
  }
}

