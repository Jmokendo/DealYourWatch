import { jsonError, jsonOk } from "@/lib/api/http";
import type { UploadResponse } from "@/lib/api/contracts";
import { auth } from "@/lib/auth";
import { uploadListingImageToCloudinary } from "@/lib/cloudinary";
import { isCloudinaryUrl } from "@/lib/listing-images";

export const runtime = "nodejs";

function normalizeUploadError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error.length > 0) {
    return error;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return "No se pudo subir la imagen.";
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return jsonError("Unauthorized", 401);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Invalid form data", 400);
  }

  const fileField = formData.get("file");
  if (!(fileField instanceof File)) {
    return jsonError("Missing file", 400);
  }

  if (fileField.size === 0) {
    return jsonError("File is empty", 400);
  }

  try {
    const listingIdField = formData.get("listingId");
    const listingId =
      typeof listingIdField === "string" && listingIdField.trim()
        ? listingIdField.trim()
        : undefined;

    const result = await uploadListingImageToCloudinary(fileField, listingId);
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    if (!isCloudinaryUrl(result.url, cloudName)) {
      return jsonError("Invalid Cloudinary upload response", 502);
    }

    const body: UploadResponse = {
      url: result.url,
      publicId: result.publicId,
      secure_url: result.url,
      public_id: result.publicId,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    };

    return jsonOk(body);
  } catch (error) {
    return jsonError(normalizeUploadError(error), 500);
  }
}
