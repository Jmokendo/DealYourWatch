"use client";

import Image from "next/image";
import type { ListingImageDto } from "@/lib/api/contracts";

interface Props {
  images: ListingImageDto[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  title: string;
}

export function ListingGallery({ images, selectedIndex, onSelect, title }: Props) {
  const selectedImage = images[selectedIndex] ?? images[0] ?? null;

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
        <div className="relative aspect-[4/3]">
          {selectedImage?.url ? (
            <Image
              src={selectedImage.url}
              alt={title}
              fill
              unoptimized
              priority
              sizes="(min-width: 1024px) 62vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-400">
              No hay fotos
            </div>
          )}
        </div>
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`Ver imagen ${index + 1}`}
              className={`relative aspect-square overflow-hidden rounded-lg border bg-zinc-100 transition ${
                selectedIndex === index
                  ? "border-zinc-900 ring-2 ring-zinc-900/10"
                  : "border-zinc-200 hover:border-zinc-400"
              }`}
            >
              <Image
                src={image.url}
                alt={`${title} imagen ${index + 1}`}
                fill
                unoptimized
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
