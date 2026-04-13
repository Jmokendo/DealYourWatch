import { requireAuthUser } from "@/lib/auth-session";
import { jsonError, jsonOk } from "@/lib/api/http";
import type { UploadResponse } from "@/lib/api/contracts";

/**
 * MVP: no object storage — return a placeholder URL so the create-listing flow works.
 * Replace with S3/R2 signed upload later; keep UploadResponse shape stable.
 */
export async function POST() {
  const user = await requireAuthUser();
  if (!user) return jsonError("Unauthorized", 401);
  const body: UploadResponse = {
    url: "https://placehold.co/1200x900/262626/eeeeee?text=Upload+placeholder",
  };
  return jsonOk(body);
}
