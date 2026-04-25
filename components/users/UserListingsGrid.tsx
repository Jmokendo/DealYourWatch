import Image from "next/image";
import Link from "next/link";
import type { ListingSummary } from "@/lib/api/contracts";
import {
  formatMoney,
  getListingDetailHref,
  getListingPrimaryImage,
} from "@/lib/marketplace-ui";

interface UserListingsGridProps {
  listings: ListingSummary[];
}

export function UserListingsGrid({ listings }: UserListingsGridProps) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {listings.map((listing) => {
        const primaryImage = getListingPrimaryImage(listing);

        return (
          <li key={listing.id}>
            <article className="overflow-hidden rounded-[18px] border border-[#d3d4d9] bg-white">
              <div
                className={`relative aspect-[1.05/0.7] ${
                  listing.status === "SOLD" ? "bg-[#7c7d81]" : "bg-[#e2e2e5]"
                }`}
              >
                {primaryImage ? (
                  <Image
                    src={primaryImage}
                    alt={listing.title}
                    fill
                    unoptimized
                    sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className={`object-cover ${listing.status === "SOLD" ? "opacity-45" : ""}`}
                  />
                ) : (
                  <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[#c3c4c9]" />
                )}

                <div className="absolute left-2 top-2 inline-flex rounded-full bg-[#dff7e9] px-2 py-0.5 text-xs font-medium text-[#0a9a4b]">
                  Verificado
                </div>

                {listing.status === "SOLD" ? (
                  <div className="absolute inset-0 flex items-center justify-center text-3xl font-semibold uppercase tracking-tight text-white">
                    Vendido
                  </div>
                ) : null}
              </div>

              <div className="space-y-2 border-t border-[#ececef] px-3 pb-3 pt-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#999ca4]">
                    {listing.model.brand.name}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#222328]">
                    {listing.model.name}
                  </h2>
                  <p className="text-sm text-[#868993]">
                    {new Date(listing.createdAt).getFullYear()} · Full set
                  </p>
                </div>

                <p
                  className={`text-[37px] font-semibold tracking-[-0.04em] ${
                    listing.status === "SOLD"
                      ? "text-[#8f9198] line-through"
                      : "text-[#1f2024]"
                  }`}
                >
                  {formatMoney(listing.price, listing.currency)}
                </p>

                {listing.status === "SOLD" ? (
                  <Link
                    href={`/listings?brand=${encodeURIComponent(
                      listing.model.brand.name,
                    )}`}
                    className="inline-flex h-10 w-full items-center justify-center rounded-full border border-[#d9d9de] text-sm font-medium text-[#676972] transition hover:border-[#b8bac3]"
                  >
                    Ver similares
                  </Link>
                ) : (
                  <Link
                    href={getListingDetailHref(listing.id)}
                    className="inline-flex h-10 w-full items-center justify-center rounded-full bg-[#191a20] text-sm font-semibold text-white transition hover:bg-[#2d2f38]"
                  >
                    Ver detalle
                  </Link>
                )}
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}

