import crypto from "node:crypto";

export const CLOUDINARY_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const CLOUDINARY_ALLOWED_FORMATS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
] as const;

export const CLOUDINARY_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset?: string;
};

export type CloudinarySignatureParams = {
  timestamp: number;
  folder: string;
  public_id: string;
  upload_preset?: string;
};

export function getCloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET?.trim();

  if (!cloudName || !apiKey || !apiSecret) return null;

  return {
    cloudName,
    apiKey,
    apiSecret,
    uploadPreset: uploadPreset || undefined,
  };
}

export function createCloudinarySignature(
  params: CloudinarySignatureParams,
  apiSecret: string,
) {
  const toSign = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(`${toSign}${apiSecret}`)
    .digest("hex");
}

export function createListingUploadPublicId(userId: string, timestamp: number) {
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `${safeUserId}_${timestamp}`;
}
