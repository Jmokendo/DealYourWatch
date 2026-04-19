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
import { NotificationDropdown } from "@/components/NotificationDropdown";

const conditions: Array<{ value: "" | Condition; label: string }> = [
  { value: "", label: "Todos" },
  { value: "NEW", label: "New" },
  { value: "MINT", label: "Mint" },
  { value: "EXCELLENT", label: "Excellent" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
];

const sortOptions = [
  { value: "RELEVANT", label: "Más relevantes" },
  { value: "NEWEST", label: "Más recientes" },
  { value: "PRICE_ASC", label: "Precio ↑" },
  { value: "PRICE_DESC", label: "Precio ↓" },
];

type AccessoryFilter = "" | "box" | "papers" | "both" | "none";

const formatShortPrice = (value: number) =>
  new Intl.NumberFormat("es-CL", {
    maximumFractionDigits: 0,
  }).format(value);

export default function ListingsPage() {
  const [listings, setListings] = useState<ListingSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState<"" | Condition>("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [accessoryFilter, setAccessoryFilter] = useState<AccessoryFilter>("");
  const [yearFilter, setYearFilter] = useState("");
  const [sortBy, setSortBy] = useState("RELEVANT");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const params = new URLSearchParams();
      params.set("status", "APPROVED");
      if (q.trim()) params.set("q", q.trim());
      if (brandFilter.trim()) params.set("brand", brandFilter.trim());
      if (minPrice.trim()) params.set("minPrice", minPrice.trim());
      if (maxPrice.trim()) params.set("maxPrice", maxPrice.trim());

      try {
        const res = await fetch(`/api/listings?${params.toString()}`);
        if (!res.ok) {
          if (!cancelled) setError("No se pudieron cargar los listings.");
          return;
        }
        const data = (await res.json()) as ListingSummary[];
        if (!cancelled) {
          setListings(data);
          setError(null);
        }
      } catch {
        if (!cancelled) setError("No se pudieron cargar los listings.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [q, brandFilter, minPrice, maxPrice]);

  const prices = listings?.map((l) => Number.parseFloat(l.price)) || [];
  const priceBounds = useMemo(() => {
    if (!prices.length) {
      return { min: 0, max: 100000 };
    }
    return {
      min: Math.min(...prices, 0),
      max: Math.max(...prices, 100000),
    };
  }, [listings]);

  const filteredListings = useMemo(() => {
    if (!listings) return [];

    return listings.filter((listing) => {
      const matchesCondition = conditionFilter
        ? listing.condition === conditionFilter
        : true;
      const matchesAccessory = accessoryFilter
        ? accessoryFilter === "box"
          ? listing.hasBox && !listing.hasPapers
          : accessoryFilter === "papers"
          ? listing.hasPapers && !listing.hasBox
          : accessoryFilter === "both"
          ? listing.hasBox && listing.hasPapers
          : accessoryFilter === "none"
          ? !listing.hasBox && !listing.hasPapers
          : true
        : true;
      const matchesYear = yearFilter
        ? new Date(listing.createdAt).getFullYear().toString() === yearFilter
        : true;

      return (
        matchesCondition &&
        matchesAccessory &&
        matchesYear
      );
    });
  }, [accessoryFilter, conditionFilter, listings, yearFilter]);

  const sortedListings = useMemo(() => {
    if (!filteredListings) return [];
    const items = [...filteredListings];

    if (sortBy === "PRICE_ASC") {
      return items.sort((a, b) => Number.parseFloat(a.price) - Number.parseFloat(b.price));
    }

    if (sortBy === "PRICE_DESC") {
      return items.sort((a, b) => Number.parseFloat(b.price) - Number.parseFloat(a.price));
    }

    if (sortBy === "NEWEST") {
      return items.sort(
        (a, b) =>
          Number(new Date(b.createdAt).valueOf()) - Number(new Date(a.createdAt).valueOf()),
      );
    }

    return items;
  }, [filteredListings, sortBy]);

  const yearOptions = useMemo(() => {
    if (!listings) return [];
    return Array.from(
      new Set(
        listings.map((listing) => new Date(listing.createdAt).getFullYear().toString()),
      ),
    ).sort((a, b) => Number(b) - Number(a));
  }, [listings]);

  const hasFilters =
    q.trim() !== "" ||
    brandFilter.trim() !== "" ||
    conditionFilter !== "" ||
    minPrice.trim() !== "" ||
    maxPrice.trim() !== "" ||
    accessoryFilter !== "" ||
    yearFilter !== "";

  const minSliderValue = Number.isFinite(Number.parseFloat(minPrice))
    ? Math.min(Math.max(Number.parseFloat(minPrice), priceBounds.min), priceBounds.max)
    : priceBounds.min;
  const maxSliderValue = Number.isFinite(Number.parseFloat(maxPrice))
    ? Math.min(Math.max(Number.parseFloat(maxPrice), priceBounds.min), priceBounds.max)
    : priceBounds.max;

  const activeFilterChips = [
    q && {
      key: "q",
      label: `Búsqueda: ${q}`,
      onRemove: () => setQ(""),
    },
    brandFilter && {
      key: "brand",
      label: `Marca: ${brandFilter}`,
      onRemove: () => setBrandFilter(""),
    },
    conditionFilter && {
      key: "condition",
      label: `Estado: ${conditions.find((item) => item.value === conditionFilter)?.label ?? conditionFilter}`,
      onRemove: () => setConditionFilter(""),
    },
    accessoryFilter && {
      key: "accessory",
      label:
        accessoryFilter === "box"
          ? "Box"
          : accessoryFilter === "papers"
          ? "Papers"
          : accessoryFilter === "both"
          ? "Box y Papers"
          : "Sin accesorios",
      onRemove: () => setAccessoryFilter(""),
    },
    yearFilter && {
      key: "year",
      label: `Año: ${yearFilter}`,
      onRemove: () => setYearFilter(""),
    },
    (minPrice.trim() !== "" || maxPrice.trim() !== "") && {
      key: "price",
      label: `Precio: ${minPrice.trim() !== "" ? formatShortPrice(Number(minPrice)) : formatShortPrice(priceBounds.min)} – ${maxPrice.trim() !== "" ? formatShortPrice(Number(maxPrice)) : formatShortPrice(priceBounds.max)}`,
      onRemove: () => {
        setMinPrice("");
        setMaxPrice("");
      },
    },
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    onRemove: () => void;
  }>;

  const clearFilters = () => {
    setQ("");
    setBrandFilter("");
    setConditionFilter("");
    setMinPrice("");
    setMaxPrice("");
    setAccessoryFilter("");
    setYearFilter("");
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="grid gap-4 rounded-[20px] border border-zinc-200 bg-white p-6 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-zinc-500">Buscador</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
              Encuentra tu próximo reloj de lujo
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
              Filtra en tiempo real por marca, precio, condición y accesorios sin pasos adicionales.
            </p>
          </div>
          <Link
            href="/sell"
            className="inline-flex h-14 items-center justify-center rounded-full bg-zinc-950 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Publicar reloj
          </Link>
        </header>

        <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-6 rounded-[20px] border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Marca</p>
              <Input
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                placeholder="Buscar marca o modelo"
                className="h-12 rounded-[14px] border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-900"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Precio</p>
                <p className="text-sm text-zinc-500">
                  {formatShortPrice(priceBounds.min)} – {formatShortPrice(priceBounds.max)}
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-2 text-sm text-zinc-600">
                    Mínimo
                    <Input
                      type="number"
                      min={0}
                      step={100}
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="0"
                      className="h-12 rounded-[14px] border-zinc-200 bg-white px-3 text-sm text-zinc-900"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-zinc-600">
                    Máximo
                    <Input
                      type="number"
                      min={0}
                      step={100}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder={formatShortPrice(priceBounds.max)}
                      className="h-12 rounded-[14px] border-zinc-200 bg-white px-3 text-sm text-zinc-900"
                    />
                  </label>
                </div>
                <div className="space-y-4 rounded-[16px] bg-zinc-50 p-4">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-zinc-500">
                    <span>Desliza para ajustar</span>
                    <span>
                      {formatShortPrice(minSliderValue)} – {formatShortPrice(maxSliderValue)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={priceBounds.min}
                    max={priceBounds.max}
                    step={100}
                    value={minSliderValue}
                    onChange={(event) => setMinPrice(event.target.value)}
                    className="w-full accent-zinc-900"
                  />
                  <input
                    type="range"
                    min={priceBounds.min}
                    max={priceBounds.max}
                    step={100}
                    value={maxSliderValue}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    className="w-full accent-zinc-900"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Estado</p>
              <div className="grid gap-2">
                {conditions.slice(1).map((condition) => (
                  <button
                    key={condition.value}
                    type="button"
                    onClick={() => setConditionFilter(condition.value)}
                    className={cn(
                      "rounded-[14px] border px-4 py-3 text-sm text-left transition",
                      conditionFilter === condition.value
                        ? "border-zinc-900 bg-zinc-950 text-white"
                        : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50",
                    )}
                  >
                    {condition.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setConditionFilter("")}
                  className="rounded-[14px] border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-50"
                >
                  Mostrar todos
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Accesorios</p>
              <div className="grid gap-2">
                {[
                  { value: "both", label: "Box y Papers" },
                  { value: "box", label: "Solo Box" },
                  { value: "papers", label: "Solo Papers" },
                  { value: "none", label: "Sin accesorios" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAccessoryFilter(option.value as AccessoryFilter)}
                    className={cn(
                      "rounded-[14px] border px-4 py-3 text-sm text-left transition",
                      accessoryFilter === option.value
                        ? "border-zinc-900 bg-zinc-950 text-white"
                        : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Año</p>
              <div className="grid gap-2">
                {yearOptions.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setYearFilter(year)}
                    className={cn(
                      "rounded-[14px] border px-4 py-3 text-sm text-left transition",
                      yearFilter === year
                        ? "border-zinc-900 bg-zinc-950 text-white"
                        : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50",
                    )}
                  >
                    {year}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setYearFilter("")}
                  className="rounded-[14px] border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-50"
                >
                  Todos los años
                </button>
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="grid gap-4 rounded-[20px] border border-zinc-200 bg-white p-6 shadow-sm sm:grid-cols-[1.4fr_auto] sm:items-center">
          <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                  <svg
                    viewBox="0 0 20 20"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="9" cy="9" r="6" />
                    <path d="m17 17-3.5-3.5" />
                  </svg>
                </span>
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Busca por marca, modelo o referencia"
                  className="h-14 w-full rounded-full border border-zinc-200 bg-white px-12 text-sm text-zinc-900 shadow-sm transition focus:border-black focus:ring-2 focus:ring-black/10"
                />
              </div>
              <div className="flex items-center gap-3">
                <NotificationDropdown />
                <Link
                  href="/sell"
                  className="inline-flex h-14 items-center justify-center rounded-full bg-zinc-950 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                  Publicar reloj
                </Link>
              </div>
            </div>

            {hasFilters ? (
              <div className="flex flex-wrap items-center gap-2 rounded-[20px] border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  {activeFilterChips.map((chip) => (
                    <Badge key={chip.key} variant="secondary" className="inline-flex items-center gap-2">
                      <span>{chip.label}</span>
                      <button
                        type="button"
                        onClick={chip.onRemove}
                        className="rounded-full p-1 text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-900"
                        aria-label={`Remove ${chip.label}`}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-auto rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-50"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-[20px] border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700 shadow-sm" role="alert">
                {error}
              </div>
            ) : null}

            {listings === null ? (
              <div className="space-y-6">
                <div className="h-14 w-72 animate-pulse rounded-full bg-zinc-100" />
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className="overflow-hidden rounded-[20px] border border-zinc-200 bg-white shadow-sm"
                    >
                      <div className="aspect-[4/3] bg-zinc-100" />
                      <div className="space-y-3 p-5">
                        <div className="h-4 w-24 animate-pulse rounded-full bg-zinc-100" />
                        <div className="h-5 w-32 animate-pulse rounded-full bg-zinc-100" />
                        <div className="h-9 animate-pulse rounded-[14px] bg-zinc-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : sortedListings.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-zinc-300 bg-zinc-50 px-8 py-16 text-center">
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">No encontramos resultados</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">
                  Ajusta los filtros o limpia para descubrir más relojes.
                </p>
              </div>
            ) : (
              <section className="space-y-6">
                <div className="flex flex-col gap-4 rounded-[20px] border border-zinc-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-zinc-600">{sortedListings.length} resultados</p>
                  <label className="flex items-center gap-3 text-sm text-zinc-600">
                    Ordenar por
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="h-12 rounded-full border border-zinc-200 bg-white px-4 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                  {sortedListings.map((listing) => {
                    const primaryImage = listing.images[0]?.url;
                    const isVerified = listing.hasBox && listing.hasPapers;
                    const offersCount = 0;

                    return (
                      <li key={listing.id}>
                        <Card className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-zinc-200 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_50px_-30px_rgba(15,23,42,0.35)]">
                          <div className="relative overflow-hidden">
                            <div className="relative aspect-[4/3] bg-zinc-100">
                              {primaryImage ? (
                                <Image
                                  src={primaryImage}
                                  alt={listing.title}
                                  fill
                                  unoptimized
                                  sizes="(min-width: 1280px) 25vw, (min-width: 768px) 45vw, 100vw"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                                  No photo available
                                </div>
                              )}
                            </div>

                            <div className="pointer-events-none absolute inset-x-0 top-4 flex items-center justify-between px-4">
                              {isVerified ? (
                                <span className="rounded-full bg-zinc-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white shadow-sm">
                                  ✓ Verificado
                                </span>
                              ) : (
                                <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-700 shadow-sm">
                                  Nuevo
                                </span>
                              )}
                              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-zinc-700 shadow-sm">
                                {offersCount} ofertas
                              </span>
                            </div>
                          </div>
                          <CardContent className="flex flex-1 flex-col gap-4 p-5">
                            <div className="space-y-3">
                              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                                {listing.model.brand.name}
                              </div>
                              <div className="space-y-1">
                                <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
                                  {listing.model.name}
                                </h2>
                                <div className="flex flex-wrap gap-2 text-sm text-zinc-500">
                                  <span>{new Date(listing.createdAt).getFullYear()}</span>
                                  <span className="inline-flex items-center gap-1">•</span>
                                  <span>{getConditionLabel(listing.condition)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-auto space-y-4">
                              <div>
                                <p className="text-sm text-zinc-500">Precio</p>
                                <p className="text-2xl font-semibold text-zinc-950">
                                  {formatMoney(listing.price, listing.currency)}
                                </p>
                              </div>
                              <div className="grid gap-3">
                                <Link
                                  href={`/listings/${listing.id}`}
                                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-zinc-950 text-sm font-semibold text-white transition hover:bg-zinc-800"
                                >
                                  Ver detalle
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
