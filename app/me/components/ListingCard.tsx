"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatMoney, getConditionLabel } from "@/lib/marketplace-ui";
import type { ListingSummary, ListingStatus } from "@/lib/api/contracts";

const STATUS_STYLES: Record<ListingStatus, string> = {
  PENDING: "border-yellow-200 bg-yellow-50 text-yellow-800",
  APPROVED: "border-green-200 bg-green-50 text-green-800",
  SOLD: "border-zinc-300 bg-zinc-100 text-zinc-600",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
  EXPIRED: "border-zinc-200 bg-zinc-50 text-zinc-400",
};

interface ListingCardProps {
  listing: ListingSummary;
}

export function ListingCard({ listing }: ListingCardProps) {
  const image = listing.images[0]?.url;
  const statusLabel =
    listing.status.charAt(0) + listing.status.slice(1).toLowerCase();

  return (
    <Card className="overflow-hidden rounded-[18px] border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-40 w-full bg-zinc-100">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
            Sin imagen
          </div>
        )}
        <span
          className={cn(
            "absolute right-2 top-2 inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium",
            STATUS_STYLES[listing.status],
          )}
        >
          {statusLabel}
        </span>
      </div>
      <CardContent className="space-y-3 p-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-400">
            {listing.model.brand.name}
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-zinc-900">
            {listing.title}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {getConditionLabel(listing.condition)}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-base font-semibold text-zinc-950">
            {formatMoney(listing.price, listing.currency)}
          </p>
          <div className="flex gap-2">
            {listing.hasBox && (
              <Badge variant="secondary" className="text-xs">
                Box
              </Badge>
            )}
            {listing.hasPapers && (
              <Badge variant="secondary" className="text-xs">
                Papers
              </Badge>
            )}
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="w-full rounded-[10px]">
          <Link href={`/listings/${listing.id}`}>Ver detalle</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
