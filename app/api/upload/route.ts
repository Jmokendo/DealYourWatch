export const runtime = "nodejs";

import { jsonError, jsonOk } from "@/lib/api/http";
import { uploadListingImageToCloudinary } from "@/lib/cloudinary";
import { getUserIdFromCookie } from "@/lib/getUser";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const userId = await getUserIdFromCookie();
  if (!userId) return jsonError("Unauthorized", 401);

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return jsonError("Invalid upload payload", 400);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return jsonError("Missing image file", 400);
  }

  const listingId = formData.get("listingId");
  if (typeof listingId !== "string" || !listingId.trim()) {
    return jsonError("Missing listingId", 400);
  }

  try {
    const uploaded = await uploadListingImageToCloudinary(file, listingId);
    console.info("Cloudinary upload complete", {
      listingId,
      publicId: uploaded.publicId,
    });
    return jsonOk({
      ...uploaded,
      secure_url: uploaded.url,
      public_id: uploaded.publicId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo subir la imagen.";
    const status = message.startsWith("Missing required Cloudinary env var")
      ? 500
      : 400;
    return jsonError(message, status);
  }
}
