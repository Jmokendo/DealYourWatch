import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ListingsFeedToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  brands: string[];
  activeBrand: string;
  onBrandChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  sortOptions: Array<{ value: string; label: string }>;
  listingCount: number;
  showBrandRail?: boolean;
  showSummary?: boolean;
}

export function ListingsFeedToolbar({
  query,
  onQueryChange,
  brands,
  activeBrand,
  onBrandChange,
  sortBy,
  onSortChange,
  sortOptions,
  listingCount,
  showBrandRail = true,
  showSummary = true,
}: ListingsFeedToolbarProps) {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <label className="relative block xl:min-w-0 xl:flex-1">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b8882]" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar marca, modelo o referencia..."
            className="h-[46px] rounded-full border-[#ddd8d1] bg-white px-11 text-base text-[#1b1b1d] shadow-none placeholder:text-[#9a978f] focus-visible:ring-black/10"
          />
        </label>

        {showBrandRail ? (
          <div className="flex gap-2 overflow-x-auto pb-1 xl:max-w-[460px] xl:justify-end">
            {brands.map((brand) => {
              const active = brand === activeBrand;

              return (
                <button
                  key={brand}
                  type="button"
                  onClick={() => onBrandChange(brand)}
                  className={[
                    "inline-flex h-9 shrink-0 items-center rounded-full border px-4 text-sm transition",
                    active
                      ? "border-[#19191c] bg-[#19191c] font-semibold text-white"
                      : "border-[#ddd8d1] bg-white text-[#5c5a55] hover:border-[#c6c1b9] hover:text-[#111111]",
                  ].join(" ")}
                >
                  {brand}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {showSummary ? (
        <div className="flex flex-col gap-3 text-sm text-[#63615d] sm:flex-row sm:items-center sm:justify-between">
          <p>{listingCount} relojes disponibles</p>

          <label className="flex items-center gap-2">
            <span>Ordenar:</span>
            <select
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value)}
              className="min-w-[9rem] rounded-full border border-transparent bg-transparent pr-6 font-medium text-[#434246] focus-visible:outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
    </section>
  );
}
