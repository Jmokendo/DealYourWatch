/**
 * DealYourWatch — API contract v1 (MVP)
 * =====================================
 * All JSON money fields are strings (decimal serialization). Dates are ISO 8601 strings.
 * Bump API_CONTRACT_VERSION only for breaking changes; extend with optional fields when possible.
 *
 * ENDPOINTS (App Router → `app/api/...`)
 * --------------------------------------
 * GET    /api/health
 * GET    /api/listings?status=
 * POST   /api/listings
 * GET    /api/listings/[id]
 * PATCH  /api/listings/[id]
 * GET    /api/listings/[id]/negotiations
 * POST   /api/listings/[id]/negotiations
 * GET    /api/negotiations/[id]
 * GET    /api/negotiations/[id]/offers
 * POST   /api/negotiations/[id]/offers
 * PATCH  /api/negotiations/[id]/offers/[offerId]
 * GET    /api/threads/[id]/messages
 * POST   /api/threads/[id]/messages
 * GET    /api/brands
 * GET    /api/brands/[slug]/models
 * POST   /api/upload
 *
 * DESIGN (screens & flows inferred from schema + product)
 * -------------------------------------------------------
 * - Home / feed: approved listings grid, filters (brand later).
 * - Create listing: form → upload image → POST listing (pending moderation).
 * - Listing detail: gallery, price, condition, box/papers, seller, CTA “Make offer”.
 * - Offer thread: messages + offer rounds (negotiation).
 * - Seller dashboard: my listings, negotiation status (later).
 * - Auth: custom JWT auth with token cookie; mutations use session user (no email fields in POST bodies).
 *
 * QA / failure points (test early)
 * --------------------------------
 * - Missing DATABASE_URL fails fast; set USE_API_MOCK=1 only for explicit mock-mode testing.
 * - Decimal parsing on client (always treat price as string from API).
 * - Listing without images (empty array).
 * - Race: two buyers start negotiation on same listing (no unique constraint by design in MVP).
 */

export const API_CONTRACT_VERSION = "1" as const;

export type Condition = "NEW" | "MINT" | "EXCELLENT" | "GOOD" | "FAIR";

export type ListingStatus =
  | "PENDING"
  | "APPROVED"
  | "SOLD"
  | "REJECTED"
  | "EXPIRED";

export const VALID_LISTING_STATUSES: ListingStatus[] = [
  "PENDING",
  "APPROVED",
  "SOLD",
  "REJECTED",
  "EXPIRED",
];

export type NegotiationStatus =
  | "ACTIVE"
  | "ACCEPTED"
  | "CLOSED"
  | "REJECTED"
  | "EXPIRED";

export type OfferStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "COUNTERED";

export interface BrandSummary {
  id: string;
  name: string;
  slug: string;
}

export interface WatchModelSummary {
  id: string;
  name: string;
  slug: string;
  reference: string | null;
  brand: BrandSummary;
}

export interface UserPublic {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

export interface ListingImageDto {
  id: string;
  url: string;
  publicId?: string | null;
  order: number;
}

export interface CreateListingImageInput {
  url: string;
  publicId?: string | null;
}

/** Card / feed shape */
export interface ListingSummary {
  id: string;
  title: string;
  description: string | null;
  price: string;
  currency: string;
  condition: Condition;
  hasBox: boolean;
  hasPapers: boolean;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  images: ListingImageDto[];
  model: WatchModelSummary;
  user: UserPublic;
}

/** Detail = summary + negotiation ids (lazy-loaded) */
export type ListingDetail = ListingSummary;

export interface CreateListingBody {
  title: string;
  /** Parsed number on wire; stored as Decimal */
  price: number;
  userName?: string;
  imageUrl?: string;
  imageUrls?: string[];
  images?: CreateListingImageInput[];
  description?: string;
  /** When omitted, server assigns catalog fallback model (see catalog.ts). */
  modelId?: string;
  condition?: Condition;
  currency?: string;
  hasBox?: boolean;
  hasPapers?: boolean;
}

export interface PatchListingBody {
  title?: string;
  description?: string | null;
  price?: number;
  condition?: Condition;
  status?: ListingStatus;
  hasBox?: boolean;
  hasPapers?: boolean;
}

export interface UploadResponse {
  url: string;
  publicId?: string;
  secure_url?: string;
  public_id?: string;
  width?: number | null;
  height?: number | null;
  bytes?: number;
}

export interface NegotiationSummary {
  id: string;
  listingId: string;
  buyerId: string;
  /** Message thread for this negotiation (null only if creation failed mid-flight). */
  threadId: string | null;
  status: NegotiationStatus;
  round: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNegotiationBody {
  buyerName?: string;
  /** Defaults to server policy (e.g. 7 days). */
  expiresInDays?: number;
}

export interface OfferDto {
  id: string;
  negotiationId: string;
  userId: string;
  amount: string;
  currency: string;
  reasonType: string;
  reasonNote: string | null;
  status: OfferStatus;
  createdAt: string;
}

export interface CreateOfferBody {
  amount: number;
  /** Defaults to OFFER (first bid from buyer). */
  reasonType?: string;
  reasonNote?: string;
  currency?: string;
}

export interface PatchOfferBody {
  action: "accept" | "reject" | "counter";
  /** Required when action is counter */
  amount?: number;
  note?: string;
  currency?: string;
}

export interface MessageDto {
  id: string;
  threadId: string;
  senderId: string | null;
  content: string;
  isSystem: boolean;
  createdAt: string;
}

export interface CreateMessageBody {
  content: string;
  /** Parsed from optional wire field; default false. */
  isSystem: boolean;
}

export interface UserNegotiation {
  id: string;
  listingId: string;
  listingTitle: string;
  status: NegotiationStatus;
  round: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  threadId: string | null;
}

export interface HealthDto {
  ok: boolean;
  mock: boolean;
  contractVersion: typeof API_CONTRACT_VERSION;
}

