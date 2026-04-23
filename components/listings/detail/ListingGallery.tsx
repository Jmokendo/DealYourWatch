"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { ListingDetail } from "@/lib/api/contracts";
import { getListingPrimaryImage } from "@/lib/marketplace-ui";

interface ListingGalleryProps {
  listing: ListingDetail;
}

function buildGalleryItems(listing: ListingDetail) {
  if (listing.images.length > 0) {
    return listing.images.map((image, index) => ({
      id: image.id,
      url: image.url,
      alt: `${listing.title} ${index + 1}`,
    }));
  }

  return Array.from({ length: 5 }).map((_, index) => ({
    id: `placeholder-${index}`,
    url: null,
    alt: `${listing.title} placeholder ${index + 1}`,
  }));
}

export function ListingGallery({ listing }: ListingGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const galleryItems = useMemo(() => buildGalleryItems(listing), [listing]);
  const primaryImage = getListingPrimaryImage(listing);
  const safeIndex =
    selectedIndex >= 0 && selectedIndex < galleryItems.length ? selectedIndex : 0;
  const selectedImage = galleryItems[safeIndex] ?? galleryItems[0];

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[26px] border border-[#e2ddd6] bg-white">
        <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-[#1d1d21] px-4 py-1.5 text-sm font-semibold text-white">
          ✓ Verificado
        </div>

        <div className="relative aspect-[1.08/0.9] bg-[#efede8]">
          {selectedImage?.url ? (
            <Image
              src={selectedImage.url}
              alt={selectedImage.alt}
              fill
              unoptimized
              sizes="(min-width: 1280px) 55vw, 100vw"
              className="object-cover"
            />
          ) : primaryImage ? (
            <Image
              src={primaryImage}
              alt={listing.title}
              fill
              unoptimized
              sizes="(min-width: 1280px) 55vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="h-20 w-20 rounded-full bg-[#e0ded8]" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {galleryItems.slice(0, 5).map((item, index) => {
          const active = index === safeIndex;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={
                active
                  ? "relative aspect-square overflow-hidden rounded-[18px] border-2 border-[#1d1d21] bg-[#efede8]"
                  : "relative aspect-square overflow-hidden rounded-[18px] border border-[#e2ddd6] bg-[#efede8]"
              }
            >
              {item.url ? (
                <Image
                  src={item.url}
                  alt={item.alt}
                  fill
                  unoptimized
                  sizes="160px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="h-10 w-10 rounded-[10px] bg-[#d9d7d2]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
