import Image from "next/image";
import Link from "next/link";
import type { ListingSummary } from "@/lib/api/contracts";
import { formatMoney, getConditionLabel } from "@/lib/marketplace-ui";

interface Props {
  listing: ListingSummary;
}

export function ListingCard({ listing }: Props) {
  const primaryImage = listing.images[0]?.url ?? null;
  const isVerified = listing.status === "APPROVED";

  const setLabel =
    listing.hasBox && listing.hasPapers
      ? "Full set"
      : listing.hasBox
        ? "Con caja"
        : listing.hasPapers
          ? "Con papeles"
          : null;

  return (
    <Link href={`/listings/${listing.id}`} className="group block focus:outline-none">
      <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white transition duration-200 group-hover:-translate-y-1 group-hover:border-zinc-300 group-hover:shadow-xl group-focus-visible:ring-2 group-focus-visible:ring-zinc-900 group-focus-visible:ring-offset-2">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={listing.title}
              fill
              unoptimized
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-xs text-zinc-400">Sin foto</span>
            </div>
          )}

          {/* Verified badge overlay */}
          {isVerified ? (
            <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50/90 px-2 py-0.5 text-xs font-medium text-emerald-700 backdrop-blur-sm">
              <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path
                  d="M2 6l3 3 5-5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Verificado
            </span>
          ) : null}
        </div>

        {/* Content */}
        <div className="space-y-3 p-4">
          {/* Brand + title */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              {listing.model.brand.name}
            </p>
            <h2 className="mt-0.5 truncate text-sm font-semibold text-zinc-950 sm:text-base">
              {listing.title}
            </h2>
          </div>

          {/* Price */}
          <p className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
            {formatMoney(listing.price, listing.currency)}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
              {getConditionLabel(listing.condition)}
            </span>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
              Acepta ofertas
            </span>
            {setLabel ? (
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                {setLabel}
              </span>
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  );
}
