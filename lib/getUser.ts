import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getUserIdFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
    return (decoded as { userId?: string }).userId ?? null;
  } catch {
    return null;
  }
}

