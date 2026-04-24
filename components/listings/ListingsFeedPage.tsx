"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Condition, ListingSummary } from "@/lib/api/contracts";
import { ListingsFeedCard } from "@/components/listings/ListingsFeedCard";
import { ListingsFeedHeader } from "@/components/listings/ListingsFeedHeader";
import { ListingsFeedToolbar } from "@/components/listings/ListingsFeedToolbar";
import { ListingsLayout } from "@/components/listings/ListingsLayout";
import { ListingsSidebar } from "@/components/listings/ListingsSidebar";
import { ListingsActiveFilters } from "@/components/listings/ListingsActiveFilters";
import { ListingsResultsHeader } from "@/components/listings/ListingsResultsHeader";

const sortOptions = [
  { value: "RELEVANT", label: "Mas relevantes" },
  { value: "NEWEST", label: "Mas recientes" },
  { value: "PRICE_ASC", label: "Precio ↑" },
  { value: "PRICE_DESC", label: "Precio ↓" },
] as const;

const conditionOptions: Array<{
  value: Condition;
  label: string;
}> = [
  { value: "NEW", label: "Nuevo" },
  { value: "MINT", label: "Muy bueno" },
  { value: "EXCELLENT", label: "Muy bueno" },
  { value: "GOOD", label: "Bueno" },
  { value: "FAIR", label: "Con detalles" },
];

const accessoryOptions = [
  { value: "FULL_SET", label: "Full set (caja + papeles)" },
  { value: "BOX_ONLY", label: "Solo caja" },
  { value: "NO_ACCESSORIES", label: "Sin accesorios" },
] as const;

const yearOptions = [
  { value: "2020_2024", label: "2020 - 2024" },
  { value: "2015_2019", label: "2015 - 2019" },
  { value: "BEFORE_2015", label: "Antes de 2015" },
] as const;

type SortValue = (typeof sortOptions)[number]["value"];
type AccessoryValue = (typeof accessoryOptions)[number]["value"] | "";
type YearValue = (typeof yearOptions)[number]["value"] | "";

interface ListingsFeedPageProps {
  initialQuery?: string;
}

function getPriceRangeLabel(minPrice: string, maxPrice: string) {
  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  });

  const minLabel = minPrice ? formatter.format(Number(minPrice)) : "0";
  const maxLabel = maxPrice ? formatter.format(Number(maxPrice)) : "999999";

  return `USD ${minLabel} - ${maxLabel}`;
}

function matchesAccessory(
  listing: ListingSummary,
  accessoryFilter: AccessoryValue,
) {
  if (!accessoryFilter) return true;
  if (accessoryFilter === "FULL_SET") return listing.hasBox && listing.hasPapers;
  if (accessoryFilter === "BOX_ONLY") return listing.hasBox && !listing.hasPapers;
  if (accessoryFilter === "NO_ACCESSORIES") {
    return !listing.hasBox && !listing.hasPapers;
  }

  return true;
}

function matchesYearRange(listing: ListingSummary, yearFilter: YearValue) {
  if (!yearFilter) return true;

  const year = new Date(listing.createdAt).getFullYear();

  if (yearFilter === "2020_2024") return year >= 2020 && year <= 2024;
  if (yearFilter === "2015_2019") return year >= 2015 && year <= 2019;
  if (yearFilter === "BEFORE_2015") return year < 2015;

  return true;
}

function getConditionCount(
  listings: ListingSummary[],
  value: Condition,
) {
  return listings.filter((listing) => listing.condition === value).length;
}

function isConditionValue(value: string): value is Condition {
  return conditionOptions.some((option) => option.value === value);
}

function isAccessoryValue(value: string): value is Exclude<AccessoryValue, ""> {
  return accessoryOptions.some((option) => option.value === value);
}

function isYearValue(value: string): value is Exclude<YearValue, ""> {
  return yearOptions.some((option) => option.value === value);
}

export function ListingsFeedPage({
  initialQuery = "",
}: ListingsFeedPageProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [listings, setListings] = useState<ListingSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [activeBrand, setActiveBrand] = useState("Todos");
  const [sortBy, setSortBy] = useState<SortValue>("RELEVANT");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [conditionFilter, setConditionFilter] = useState<Condition | "">("");
  const [accessoryFilter, setAccessoryFilter] = useState<AccessoryValue>("");
  const [yearFilter, setYearFilter] = useState<YearValue>("");

  const searchMode = query.trim() !== "";

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const params = new URLSearchParams();
      params.set("status", "APPROVED");
      if (query.trim()) params.set("q", query.trim());

      try {
        const response = await fetch(`/api/listings?${params.toString()}`);
        if (!response.ok) {
          if (!cancelled) setError("No se pudieron cargar los listings.");
          return;
        }

        const data = (await response.json()) as ListingSummary[];
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
  }, [query]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set("q", query.trim());
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [pathname, query, router]);

  const brandOptions = useMemo(() => {
    const brands = listings
      ? Array.from(new Set(listings.map((listing) => listing.model.brand.name)))
      : [];

    return ["Todos", ...brands].slice(0, 8);
  }, [listings]);

  const selectedBrand = brandOptions.includes(activeBrand) ? activeBrand : "Todos";

  const filteredListings = useMemo(() => {
    if (!listings) return [];

    return listings.filter((listing) => {
      const numericPrice = Number.parseFloat(listing.price);
      const min = minPrice ? Number.parseFloat(minPrice) : null;
      const max = maxPrice ? Number.parseFloat(maxPrice) : null;

      const matchesBrand =
        selectedBrand === "Todos" || listing.model.brand.name === selectedBrand;
      const matchesMin = min === null || numericPrice >= min;
      const matchesMax = max === null || numericPrice <= max;
      const matchesCondition =
        !conditionFilter || listing.condition === conditionFilter;

      return (
        matchesBrand &&
        matchesMin &&
        matchesMax &&
        matchesCondition &&
        matchesAccessory(listing, accessoryFilter) &&
        matchesYearRange(listing, yearFilter)
      );
    });
  }, [
    accessoryFilter,
    conditionFilter,
    listings,
    maxPrice,
    minPrice,
    selectedBrand,
    yearFilter,
  ]);

  const sortedListings = useMemo(() => {
    const items = [...filteredListings];

    if (sortBy === "PRICE_ASC") {
      return items.sort(
        (left, right) =>
          Number.parseFloat(left.price) - Number.parseFloat(right.price),
      );
    }

    if (sortBy === "PRICE_DESC") {
      return items.sort(
        (left, right) =>
          Number.parseFloat(right.price) - Number.parseFloat(left.price),
      );
    }

    if (sortBy === "NEWEST") {
      return items.sort(
        (left, right) =>
          new Date(right.createdAt).valueOf() - new Date(left.createdAt).valueOf(),
      );
    }

    return items;
  }, [filteredListings, sortBy]);

  const activeFilters = useMemo(() => {
    if (!searchMode) return [];

    const filters: Array<{
      key: string;
      label: string;
      onRemove: () => void;
    }> = [];

    if (selectedBrand !== "Todos") {
      filters.push({
        key: "brand",
        label: selectedBrand,
        onRemove: () => setActiveBrand("Todos"),
      });
    }

    if (minPrice || maxPrice) {
      filters.push({
        key: "price",
        label: getPriceRangeLabel(minPrice, maxPrice),
        onRemove: () => {
          setMinPrice("");
          setMaxPrice("");
        },
      });
    }

    if (conditionFilter) {
      const label =
        conditionOptions.find((option) => option.value === conditionFilter)?.label ??
        conditionFilter;

      filters.push({
        key: "condition",
        label,
        onRemove: () => setConditionFilter(""),
      });
    }

    if (accessoryFilter) {
      const label =
        accessoryOptions.find((option) => option.value === accessoryFilter)?.label ??
        accessoryFilter;

      filters.push({
        key: "accessory",
        label,
        onRemove: () => setAccessoryFilter(""),
      });
    }

    if (yearFilter) {
      const label =
        yearOptions.find((option) => option.value === yearFilter)?.label ??
        yearFilter;

      filters.push({
        key: "year",
        label,
        onRemove: () => setYearFilter(""),
      });
    }

    return filters;
  }, [
    accessoryFilter,
    conditionFilter,
    maxPrice,
    minPrice,
    searchMode,
    selectedBrand,
    yearFilter,
  ]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
  };

  const handleConditionChange = (value: string) => {
    if (value === "" || isConditionValue(value)) {
      setConditionFilter(value);
    }
  };

  const handleAccessoryChange = (value: string) => {
    if (value === "" || isAccessoryValue(value)) {
      setAccessoryFilter(value);
    }
  };

  const handleYearChange = (value: string) => {
    if (value === "" || isYearValue(value)) {
      setYearFilter(value);
    }
  };

  const clearSearchFilters = () => {
    setActiveBrand("Todos");
    setMinPrice("");
    setMaxPrice("");
    setConditionFilter("");
    setAccessoryFilter("");
    setYearFilter("");
  };

  const toolbar = (
    <ListingsFeedToolbar
      query={query}
      onQueryChange={handleQueryChange}
      brands={brandOptions}
      activeBrand={selectedBrand}
      onBrandChange={setActiveBrand}
      sortBy={sortBy}
      onSortChange={setSortBy}
      sortOptions={sortOptions}
      listingCount={sortedListings.length}
      showBrandRail={!searchMode}
      showSummary={!searchMode}
    />
  );

  const sidebar = searchMode ? (
    <ListingsSidebar
      brands={brandOptions.filter((brand) => brand !== "Todos").map((brand) => ({
        label: brand,
        count: listings?.filter((listing) => listing.model.brand.name === brand).length ?? 0,
      }))}
      activeBrand={selectedBrand}
      onBrandChange={setActiveBrand}
      minPrice={minPrice}
      maxPrice={maxPrice}
      onMinPriceChange={setMinPrice}
      onMaxPriceChange={setMaxPrice}
      conditions={conditionOptions.map((option) => ({
        value: option.value,
        label: option.label,
        count: listings ? getConditionCount(listings, option.value) : 0,
      }))}
      activeCondition={conditionFilter}
      onConditionChange={handleConditionChange}
      accessories={accessoryOptions.map((option) => ({
        value: option.value,
        label: option.label,
        count:
          listings?.filter((listing) => matchesAccessory(listing, option.value)).length ?? 0,
      }))}
      activeAccessory={accessoryFilter}
      onAccessoryChange={handleAccessoryChange}
      years={yearOptions.map((option) => ({
        value: option.value,
        label: option.label,
        count:
          listings?.filter((listing) => matchesYearRange(listing, option.value)).length ?? 0,
      }))}
      activeYear={yearFilter}
      onYearChange={handleYearChange}
      onApplyFilters={() => undefined}
    />
  ) : null;

  const resultsHeader = searchMode ? (
    <ListingsResultsHeader
      count={sortedListings.length}
      sortBy={sortBy}
      onSortChange={setSortBy}
      sortOptions={sortOptions.map((option) => ({
        value: option.value,
        label: option.label,
      }))}
    />
  ) : null;

  const filterChips = searchMode ? (
    <ListingsActiveFilters
      filters={activeFilters}
      onClear={clearSearchFilters}
    />
  ) : null;

  return (
    <main className="min-h-screen bg-[#f6f5f2] text-[#1b1b1d]">
      <ListingsFeedHeader />

      <section className="px-5 pb-10 pt-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1380px]">
          <ListingsLayout
            searchMode={searchMode}
            toolbar={toolbar}
            sidebar={sidebar}
            resultsHeader={resultsHeader}
            activeFilters={filterChips}
          >
            {error ? (
              <div
                className="mt-6 rounded-[22px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            {listings === null ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-[22px] border border-[#e7e3dc] bg-white"
                  >
                    <div className="aspect-[1.08/0.72] animate-pulse bg-[#ece9e4]" />
                    <div className="space-y-3 p-4">
                      <div className="h-3 w-16 animate-pulse rounded-full bg-[#ece9e4]" />
                      <div className="h-5 w-40 animate-pulse rounded-full bg-[#ece9e4]" />
                      <div className="h-10 animate-pulse rounded-full bg-[#ece9e4]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedListings.length === 0 ? (
              <div className="mt-8 rounded-[24px] border border-dashed border-[#d5d0c8] bg-white px-8 py-[4.5rem] text-center">
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#171717]">
                  No encontramos resultados
                </h2>
                <p className="mt-3 text-sm text-[#78746d]">
                  Proba otra busqueda o cambia los filtros para descubrir mas relojes.
                </p>
              </div>
            ) : (
              <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {sortedListings.map((listing, index) => (
                  <li key={listing.id}>
                    <ListingsFeedCard listing={listing} index={index} />
                  </li>
                ))}
              </ul>
            )}
          </ListingsLayout>
        </div>
      </section>
    </main>
  );
}
