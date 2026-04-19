"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { ListingDetail } from "@/lib/api/contracts";

export default function ListingGallery({ listing }: { listing: ListingDetail }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const imageKey = useMemo(
    () => listing.images.map((image) => image.id).join(","),
    [listing.images],
  );

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [imageKey]);

  const selectedImage = listing.images[selectedImageIndex] ?? listing.images[0];
  const thumbnails = listing.images.length > 1 ? listing.images : [];

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[24px] border border-zinc-200 bg-white shadow-sm">
        <div className="relative overflow-hidden bg-zinc-100">
          <div className="relative aspect-[4/3]">
            {selectedImage?.url ? (
              <Image
                src={selectedImage.url}
                alt={listing.title}
                fill
                unoptimized
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                No listing photo
              </div>
            )}
          </div>
        </div>

        {thumbnails.length > 1 ? (
          <div className="flex gap-3 overflow-x-auto border-t border-zinc-200 bg-white p-4">
            {thumbnails.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedImageIndex(index)}
                className={`relative min-w-[100px] rounded-3xl border p-1 transition duration-200 ${
                  index === selectedImageIndex
                    ? "border-zinc-900 bg-zinc-950/10"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
              >
                <div className="relative aspect-[4/3] w-24 overflow-hidden rounded-3xl bg-zinc-100">
                  {image.url ? (
                    <Image
                      src={image.url}
                      alt={`${listing.title} thumbnail ${index + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {listing.description ? (
        <Card className="rounded-[24px] border border-zinc-200 bg-white">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-950">Descripción</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-600">{listing.description}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
