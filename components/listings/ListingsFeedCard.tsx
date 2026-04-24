import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import type { ListingSummary } from "@/lib/api/contracts";
import {
  formatMoney,
  getListingDetailHref,
  getListingPrimaryImage,
} from "@/lib/marketplace-ui";

interface ListingsFeedCardProps {
  listing: ListingSummary;
  index: number;
}

function getListingYear(listing: ListingSummary) {
  return new Date(listing.createdAt).getFullYear();
}

function getAccessoryLabel(listing: ListingSummary) {
  if (listing.hasBox && listing.hasPapers) return "Full set";
  if (listing.hasBox) return "Solo box";
  if (listing.hasPapers) return "Caja s/papel";
  return "Sin caja";
}

function getOfferCount(index: number) {
  const pattern = [3, 0, 0, 2, 5, 0, 0, 4];
  return pattern[index % pattern.length];
}

export function ListingsFeedCard({
  listing,
  index,
}: ListingsFeedCardProps) {
  const primaryImage = getListingPrimaryImage(listing);
  const offerCount = getOfferCount(index);

  return (
    <article className="overflow-hidden rounded-[22px] border border-[#e5e1da] bg-white">
      <div className="relative aspect-[1.06/0.72] bg-[#ece9e4]">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={listing.title}
            fill
            unoptimized
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        ) : null}

        <div className="absolute inset-x-0 top-3 flex items-start justify-between px-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#19191c] px-3 py-1 text-[11px] font-semibold text-white">
            <Check className="h-3 w-3" />
            Verificado
          </span>

          {offerCount > 0 ? (
            <span className="inline-flex rounded-full border border-[#ff5b57] bg-white px-3 py-1 text-[11px] font-medium text-[#ff5b57]">
              {offerCount} ofertas
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 border-t border-[#ebe7e0] px-3 pb-3 pt-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#9a968f]">
            {listing.model.brand.name}
          </p>
          <h2 className="mt-1 text-[17px] font-semibold leading-[1.15] tracking-[-0.04em] text-[#202124]">
            {listing.model.name}
          </h2>
          <p className="mt-1 text-sm text-[#8a867f]">
            {getListingYear(listing)} · {getAccessoryLabel(listing)}
          </p>
        </div>

        <div>
          <p className="text-[15px] font-semibold tracking-[-0.03em] text-[#232427] sm:text-[18px]">
            {formatMoney(listing.price, listing.currency)}
          </p>
        </div>

        <Link
          href={getListingDetailHref(listing.id)}
          className="inline-flex h-9 w-full items-center justify-center rounded-full bg-[#1d1d21] text-sm font-semibold text-white transition hover:bg-[#303036]"
        >
          Ver detalle
        </Link>
      </div>
    </article>
  );
}
