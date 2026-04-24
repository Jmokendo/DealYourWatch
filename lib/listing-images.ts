const PLACEHOLDER_HOSTS = new Set(["placehold.co", "via.placeholder.com"]);
const PLACEHOLDER_TEXT_MARKERS = [
  "upload+placeholder",
  "upload%20placeholder",
  "upload placeholder",
];

function tryParseAbsoluteUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function isHttpProtocol(protocol: string) {
  return protocol === "http:" || protocol === "https:";
}

export function isKnownPlaceholderImageUrl(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return true;
  if (normalized === "upload placeholder") return true;

  const parsed = tryParseAbsoluteUrl(normalized);
  if (!parsed) return false;
  if (!isHttpProtocol(parsed.protocol)) return false;

  const host = parsed.hostname.toLowerCase();
  if (PLACEHOLDER_HOSTS.has(host)) return true;

  const search = parsed.search.toLowerCase();
  return PLACEHOLDER_TEXT_MARKERS.some((marker) => search.includes(marker));
}

export function normalizeListingImageUrl(
  value: string | null | undefined,
): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (isKnownPlaceholderImageUrl(trimmed)) return null;

  // Support app-local images while validating remote URLs strictly.
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  const parsed = tryParseAbsoluteUrl(trimmed);
  if (!parsed || !isHttpProtocol(parsed.protocol)) return null;
  return parsed.toString();
}

export function isCloudinaryUrl(value: string, cloudName?: string): boolean {
  const parsed = tryParseAbsoluteUrl(value.trim());
  if (!parsed || parsed.protocol !== "https:") return false;
  if (parsed.hostname.toLowerCase() !== "res.cloudinary.com") return false;
  if (!cloudName) return true;
  return parsed.pathname.startsWith(`/${cloudName}/`);
}
