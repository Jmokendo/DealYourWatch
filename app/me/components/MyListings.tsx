"use client";

import { RefreshCw, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useListings } from "@/hooks/useListings";
import { ListingCard } from "./ListingCard";

function SkeletonCard() {
  return (
    <div className="h-72 animate-pulse rounded-[18px] bg-zinc-100" />
  );
}

export function MyListings() {
  const { listings, loading, error, reload } = useListings({ ownerId: "me" });

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
        <Button variant="outline" size="sm" onClick={reload}>
          <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
        </Button>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-14 text-center">
        <List className="h-8 w-8 text-zinc-300" />
        <div>
          <p className="text-sm font-medium text-zinc-600">
            Aún no tenés publicaciones
          </p>
          <p className="mt-0.5 text-xs text-zinc-400">
            Publicá tu primer reloj y empezá a vender.
          </p>
        </div>
        <Button asChild variant="default" size="sm" className="mt-2 bg-zinc-950 text-white hover:bg-zinc-800">
          <a href="/sell">Publicar reloj</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={reload}>
          <RefreshCw className="mr-2 h-4 w-4" /> Actualizar
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
