import { jsonError, jsonOk } from "@/lib/api/http";
import type { UploadResponse } from "@/lib/api/contracts";
import { getUserIdFromCookie } from "@/lib/getUser";

// ⚠️ SOLO UNA VEZ
export const runtime = "nodejs";

/**
 * MVP: placeholder upload.
 * Luego lo conectamos a Cloudinary.
 */
export async function POST() {
  const userId = await getUserIdFromCookie();
  if (!userId) return jsonError("Unauthorized", 401);

  const body: UploadResponse = {
    url: "https://placehold.co/1200x900/262626/eeeeee?text=Upload+placeholder",
  };

  return jsonOk(body);
}