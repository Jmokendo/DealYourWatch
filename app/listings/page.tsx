"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Condition, ListingSummary } from "@/lib/api/contracts";
import { cn } from "@/lib/utils";
import { formatMoney, getConditionLabel } from "@/lib/marketplace-ui";

const conditions: Array<{ value: "" | Condition; label: string }> = [
  { value: "", label: "Any condition" },
  { value: "NEW", label: "New" },
  { value: "MINT", label: "Mint" },
  { value: "EXCELLENT", label: "Excellent" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
];

export default function ListingsPage() {
  const [listings, setListings] = useState<ListingSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [brandFilter, setBrandFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState<"" | Condition>("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch("/api/listings?status=APPROVED");
        if (!res.ok) {
          if (!cancelled) setError("We couldn't load listings right now.");
          return;
        }
        const data = (await res.json()) as ListingSummary[];
        if (!cancelled) {
          setListings(data);
          setError(null);
        }
      } catch {
        if (!cancelled) setError("We couldn't load listings right now.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredListings = useMemo(() => {
    if (!listings) return [];

    const min = Number.parseFloat(minPrice);
    const max = Number.parseFloat(maxPrice);

    return listings.filter((listing) => {
      const price = Number.parseFloat(listing.price);
      const matchesBrand = brandFilter
        ? listing.model.brand.name
            .toLowerCase()
            .includes(brandFilter.trim().toLowerCase())
        : true;
      const matchesCondition = conditionFilter
        ? listing.condition === conditionFilter
        : true;
      const matchesMin = Number.isFinite(min) ? price >= min : true;
      const matchesMax = Number.isFinite(max) ? price <= max : true;

      return matchesBrand && matchesCondition && matchesMin && matchesMax;
    });
  }, [brandFilter, conditionFilter, listings, maxPrice, minPrice]);

  const hasFilters =
    brandFilter.trim() !== "" ||
    conditionFilter !== "" ||
    minPrice.trim() !== "" ||
    maxPrice.trim() !== "";

  return (
    <main className="mx-auto flex min-h-full max-w-6xl flex-1 flex-col gap-8 px-6 py-16">
      <section className="space-y-3">
        <Badge variant="secondary" className="w-fit">
          Marketplace
        </Badge>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Explore listings</h1>
          <p className="max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
            Browse verified watches, compare pricing, and open the listing to make an offer.
          </p>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 md:grid-cols-4">
        <label className="text-sm text-zinc-700">
          Brand
          <Input
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            placeholder="Rolex, Omega..."
            className="mt-1 bg-white"
          />
        </label>
        <label className="text-sm text-zinc-700">
          Min price
          <Input
            type="number"
            min={0}
            step="0.01"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="0"
            className="mt-1 bg-white"
          />
        </label>
        <label className="text-sm text-zinc-700">
          Max price
          <Input
            type="number"
            min={0}
            step="0.01"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="50000"
            className="mt-1 bg-white"
          />
        </label>
        <label className="text-sm text-zinc-700">
          Condition
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value as "" | Condition)}
            className="mt-1 flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
          >
            {conditions.map((condition) => (
              <option key={condition.label} value={condition.value}>
                {condition.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {!listings ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-48 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100"
            />
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center">
          <h2 className="text-lg font-medium text-zinc-900">No listings yet</h2>
          <p className="mt-2 text-sm text-zinc-600">
            {hasFilters
              ? "Try clearing a filter to see more watches."
              : "Approved listings will appear here as soon as sellers publish them."}
          </p>
        </div>
      ) : (
        <section className="space-y-3">
          <p className="text-sm text-zinc-600">
            {filteredListings.length} listing{filteredListings.length === 1 ? "" : "s"} available
          </p>
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredListings.map((listing) => {
              const primaryImage = listing.images[0]?.url;

              return (
                <li key={listing.id}>
                  <Link href={`/listings/${listing.id}`} className="block h-full">
                    <Card
                      className={cn(
                        "h-full overflow-hidden rounded-2xl border-zinc-200 transition hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-md focus-within:ring-2 focus-within:ring-zinc-400",
                      )}
                    >
                      <div className="relative flex aspect-[4/3] items-center justify-center bg-zinc-100">
                        {primaryImage ? (
                          <Image
                            src={primaryImage}
                            alt={listing.title}
                            fill
                            unoptimized
                            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-sm text-zinc-500">No photo</span>
                        )}
                      </div>
                      <CardContent className="space-y-4 p-5">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                            <Badge variant="outline">{listing.model.brand.name}</Badge>
                            <Badge variant="outline">
                              {getConditionLabel(listing.condition)}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <h2 className="text-lg font-semibold text-zinc-900">
                              {listing.title}
                            </h2>
                            <p className="text-2xl font-semibold text-zinc-900">
                              {formatMoney(listing.price, listing.currency)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-zinc-600">
                          <span className="rounded-full bg-zinc-100 px-2.5 py-1">
                            {listing.hasBox ? "Box included" : "No box"}
                          </span>
                          <span className="rounded-full bg-zinc-100 px-2.5 py-1">
                            {listing.hasPapers ? "Papers included" : "No papers"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-600">View listing</span>
                          <span className="font-medium text-zinc-900">Open</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}
