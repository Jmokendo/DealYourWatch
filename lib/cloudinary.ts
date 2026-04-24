import "server-only";

import { randomBytes } from "crypto";
import {
  v2 as cloudinary,
  type UploadApiErrorResponse,
  type UploadApiResponse,
} from "cloudinary";
import { isCloudinaryUrl } from "@/lib/listing-images";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const DEFAULT_PUBLIC_ROOT = "dealyourwatch/listings";
const RANDOM_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const DEFAULT_PUBLIC_ID_SEGMENT = "upload";

let cloudinaryConfigured = false;

function requireEnv(
  name:
    | "CLOUDINARY_CLOUD_NAME"
    | "CLOUDINARY_API_KEY"
    | "CLOUDINARY_API_SECRET",
) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required Cloudinary env var: ${name}`);
  }
  return value;
}

export function getCloudinaryConfig() {
  return {
    cloudName: requireEnv("CLOUDINARY_CLOUD_NAME"),
    apiKey: requireEnv("CLOUDINARY_API_KEY"),
    apiSecret: requireEnv("CLOUDINARY_API_SECRET"),
    publicRoot:
      process.env.CLOUDINARY_UPLOAD_FOLDER?.trim() || DEFAULT_PUBLIC_ROOT,
  };
}

export function validateImageFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo debe ser una imagen.");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("La imagen supera el maximo de 10MB.");
  }
}

function sanitizePublicIdSegment(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!normalized) {
    throw new Error("Invalid listingId for upload.");
  }

  return normalized;
}

function createShortRandomString(length: number) {
  const bytes = randomBytes(length);
  let result = "";

  for (let index = 0; index < length; index += 1) {
    result += RANDOM_ALPHABET[bytes[index] % RANDOM_ALPHABET.length];
  }

  return result;
}

export function buildListingImagePublicId(listingId: string) {
  const { publicRoot } = getCloudinaryConfig();
  const safeListingId = sanitizePublicIdSegment(listingId);
  const timestamp = Date.now();
  const random = createShortRandomString(6);

  return `${publicRoot}/${safeListingId}/${timestamp}-${random}`;
}

function ensureCloudinaryConfigured() {
  if (cloudinaryConfigured) return;

  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  cloudinaryConfigured = true;
}

export async function uploadListingImageToCloudinary(
  file: File,
  listingId?: string,
) {
  validateImageFile(file);
  const { cloudName } = getCloudinaryConfig();
  ensureCloudinaryConfigured();

  const publicId = buildListingImagePublicId(
    listingId?.trim() || DEFAULT_PUBLIC_ID_SEGMENT,
  );
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadResult = await new Promise<UploadApiResponse>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          public_id: publicId,
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            reject(new Error(error.message || "Cloudinary upload failed."));
            return;
          }

          if (!result?.secure_url || !result.public_id) {
            reject(new Error("Cloudinary upload returned an invalid response."));
            return;
          }

          resolve(result);
        },
      );

      stream.end(buffer);
    },
  );

  const secureUrl = uploadResult.secure_url.trim();
  if (!isCloudinaryUrl(secureUrl, cloudName)) {
    throw new Error("Cloudinary upload returned an unexpected URL.");
  }

  return {
    url: secureUrl,
    publicId: uploadResult.public_id,
    width: uploadResult.width ?? null,
    height: uploadResult.height ?? null,
    bytes: uploadResult.bytes ?? file.size,
  };
}
