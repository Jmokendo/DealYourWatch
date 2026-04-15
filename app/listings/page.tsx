"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Condition, ListingSummary } from "@/lib/api/contracts";
import { ListingCard } from "./_components/ListingCard";

// ─── Filter config ────────────────────────────────────────────────────────────

const conditionChips: Array<{ value: "" | Condition; label: string }> = [
  { value: "", label: "Todos" },
  { value: "NEW", label: "New" },
  { value: "MINT", label: "Mint" },
  { value: "EXCELLENT", label: "Excellent" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
];

type PriceRange = "" | "0-5000" | "5000-15000" | "15000-50000" | "50000+";

const priceChips: Array<{ value: PriceRange; label: string }> = [
  { value: "", label: "Cualquier precio" },
  { value: "0-5000", label: "< $5.000" },
  { value: "5000-15000", label: "$5.000 – $15.000" },
  { value: "15000-50000", label: "$15.000 – $50.000" },
  { value: "50000+", label: "$50.000+" },
];

// ─── Chip button ─────────────────────────────────────────────────────────────

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
        active
          ? "border-zinc-900 bg-zinc-900 text-white"
          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div className="aspect-[4/3] animate-pulse bg-zinc-100" />
      <div className="space-y-3 p-4">
        <div className="space-y-1.5">
          <div className="h-2.5 w-16 animate-pulse rounded-full bg-zinc-100" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
        </div>
        <div className="h-7 w-1/2 animate-pulse rounded bg-zinc-100" />
        <div className="flex gap-1.5">
          <div className="h-6 w-20 animate-pulse rounded-full bg-zinc-100" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-zinc-100" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ListingsPage() {
  const [listings, setListings] = useState<ListingSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [conditionFilter, setConditionFilter] = useState<"" | Condition>("");
  const [priceRange, setPriceRange] = useState<PriceRange>("");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch("/api/listings?status=APPROVED");
        if (!res.ok) {
          if (!cancelled) setError("No pudimos cargar los listings ahora.");
          return;
        }
        const data = (await res.json()) as ListingSummary[];
        if (!cancelled) {
          setListings(data);
          setError(null);
        }
      } catch {
        if (!cancelled) setError("No pudimos cargar los listings ahora.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredListings = useMemo(() => {
    if (!listings) return [];

    return listings.filter((listing) => {
      const price = Number.parseFloat(listing.price);
      const q = query.trim().toLowerCase();

      const matchesQuery = q
        ? listing.title.toLowerCase().includes(q) ||
          listing.model.brand.name.toLowerCase().includes(q) ||
          listing.model.name.toLowerCase().includes(q)
        : true;

      const matchesCondition = conditionFilter
        ? listing.condition === conditionFilter
        : true;

      const matchesPrice =
        priceRange === ""
          ? true
          : priceRange === "0-5000"
            ? price < 5000
            : priceRange === "5000-15000"
              ? price >= 5000 && price < 15000
              : priceRange === "15000-50000"
                ? price >= 15000 && price < 50000
                : price >= 50000;

      return matchesQuery && matchesCondition && matchesPrice;
    });
  }, [query, conditionFilter, listings, priceRange]);

  const hasFilters =
    query.trim() !== "" || conditionFilter !== "" || priceRange !== "";

  function clearFilters() {
    setQuery("");
    setConditionFilter("");
    setPriceRange("");
  }

  return (
    <main className="mx-auto flex min-h-full max-w-7xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Relojes</h1>
        <p className="text-sm text-zinc-500">
          Descubrí relojes verificados, comparás precios y hacés tu oferta.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por marca, modelo o referencia..."
          className="h-12 rounded-xl pl-11 pr-4 text-sm shadow-sm"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 hover:text-zinc-700"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* Filter chips */}
      <div className="space-y-3">
        {/* Condition */}
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Condición
          </span>
          <div className="flex flex-wrap gap-2">
            {conditionChips.map((chip) => (
              <Chip
                key={chip.value}
                active={conditionFilter === chip.value}
                onClick={() => setConditionFilter(chip.value)}
              >
                {chip.label}
              </Chip>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Precio
          </span>
          <div className="flex flex-wrap gap-2">
            {priceChips.map((chip) => (
              <Chip
                key={chip.value}
                active={priceRange === chip.value}
                onClick={() => setPriceRange(chip.value)}
              >
                {chip.label}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error ? (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {/* Loading */}
      {!listings && !error ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : null}

      {/* Results + clear */}
      {listings ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            {filteredListings.length}{" "}
            {filteredListings.length === 1 ? "reloj disponible" : "relojes disponibles"}
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900"
            >
              <X className="h-3.5 w-3.5" />
              Limpiar filtros
            </button>
          ) : null}
        </div>
      ) : null}

      {/* Empty state */}
      {listings && filteredListings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-16 text-center">
          <p className="text-lg font-semibold text-zinc-900">
            {hasFilters ? "Sin resultados" : "Todavía no hay listings"}
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            {hasFilters
              ? "Probá eliminando algún filtro para ver más relojes."
              : "Los listings aprobados aparecerán acá cuando los vendedores los publiquen."}
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:border-zinc-500 hover:bg-zinc-50"
            >
              Limpiar filtros
            </button>
          ) : null}
        </div>
      ) : null}

      {/* Grid */}
      {listings && filteredListings.length > 0 ? (
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {filteredListings.map((listing) => (
            <li key={listing.id}>
              <ListingCard listing={listing} />
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
