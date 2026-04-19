import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api/http";

export async function GET() {
  const session = await auth();
  if (!session) return jsonError("Unauthorized", 401);

  const db = getPrisma();
  if (!db) {
    return jsonOk({
      id: session.user.id,
      email: "dev@test.com",
      name: "Dev User",
      role: session.user.role,
      image: null,
    });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true, image: true },
  });

  if (!user) return jsonError("User not found", 404);

  return jsonOk(user);
}
