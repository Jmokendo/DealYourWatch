import "server-only";

import { createHash, randomBytes } from "crypto";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const DEFAULT_PUBLIC_ROOT = "dealyourwatch/listings";
const RANDOM_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

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

function buildSignature(params: Record<string, string>, apiSecret: string) {
  const toSign = Object.entries(params)
    .filter(([, value]) => value.length > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1").update(`${toSign}${apiSecret}`).digest("hex");
}

export async function uploadListingImageToCloudinary(
  file: File,
  listingId: string,
) {
  validateImageFile(file);

  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const uploadTimestamp = Math.floor(Date.now() / 1000).toString();
  const publicId = buildListingImagePublicId(listingId);
  const signatureParams = {
    public_id: publicId,
    timestamp: uploadTimestamp,
  };

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("public_id", publicId);
  formData.append("timestamp", uploadTimestamp);
  formData.append("signature", buildSignature(signatureParams, apiSecret));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = (await response.json()) as
    | {
        secure_url?: string;
        public_id?: string;
        width?: number;
        height?: number;
        bytes?: number;
        error?: { message?: string };
      }
    | undefined;

  if (!response.ok || !data?.secure_url || !data.public_id) {
    throw new Error(data?.error?.message ?? "No se pudo subir la imagen.");
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width ?? null,
    height: data.height ?? null,
    bytes: data.bytes ?? file.size,
  };
}
