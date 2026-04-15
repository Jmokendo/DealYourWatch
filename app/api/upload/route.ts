import { jsonError, jsonOk } from "@/lib/api/http";
import type { UploadSignatureResponse } from "@/lib/api/contracts";
import { requireAuthUser } from "@/lib/auth-session";
import {
  CLOUDINARY_ALLOWED_MIME_TYPES,
  CLOUDINARY_MAX_FILE_SIZE_BYTES,
  createCloudinarySignature,
  createListingUploadPublicId,
  getCloudinaryConfig,
  type CloudinarySignatureParams,
} from "@/lib/cloudinary";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;

const globalForUploadRateLimit = globalThis as unknown as {
  uploadSignatureRateLimit?: Map<string, { count: number; resetAt: number }>;
};

const rateLimit =
  globalForUploadRateLimit.uploadSignatureRateLimit ??
  new Map<string, { count: number; resetAt: number }>();

if (!globalForUploadRateLimit.uploadSignatureRateLimit) {
  globalForUploadRateLimit.uploadSignatureRateLimit = rateLimit;
}

function isRateLimited(userId: string) {
  const now = Date.now();
  const current = rateLimit.get(userId);

  if (!current || current.resetAt <= now) {
    rateLimit.set(userId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  current.count += 1;
  return false;
}

export async function POST() {
  const user = await requireAuthUser();
  if (!user) return jsonError("Unauthorized", 401);

  if (isRateLimited(user.id)) {
    return jsonError("Too many upload signature requests", 429, "RATE_LIMITED");
  }

  const config = getCloudinaryConfig();
  if (!config) {
    return jsonError("Cloudinary is not configured", 503, "UPLOAD_NOT_CONFIGURED");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `dealyourwatch/listings/${user.id}`;
  const publicId = createListingUploadPublicId(user.id, timestamp);

  const params: CloudinarySignatureParams = {
    timestamp,
    folder,
    public_id: publicId,
    upload_preset: config.uploadPreset,
  };

  const signature = createCloudinarySignature(params, config.apiSecret);

  const body: UploadSignatureResponse = {
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    timestamp,
    signature,
    folder,
    publicId,
    uploadPreset: config.uploadPreset,
    allowedMimeTypes: [...CLOUDINARY_ALLOWED_MIME_TYPES],
    maxFileSize: CLOUDINARY_MAX_FILE_SIZE_BYTES,
  };

  return jsonOk(body);
}
