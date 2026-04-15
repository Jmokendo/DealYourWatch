-- Add new ListingStatus values
ALTER TYPE "ListingStatus" ADD VALUE IF NOT EXISTS 'ACTIVE';
ALTER TYPE "ListingStatus" ADD VALUE IF NOT EXISTS 'PAUSED';
ALTER TYPE "ListingStatus" ADD VALUE IF NOT EXISTS 'DELETED';

-- Add new NegotiationStatus value
ALTER TYPE "NegotiationStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';

-- Add new OfferStatus value
ALTER TYPE "OfferStatus" ADD VALUE IF NOT EXISTS 'WITHDRAWN';

-- Add year column to listings
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "year" INTEGER;
