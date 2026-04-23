interface ListingsResultsHeaderProps {
  count: number;
  sortBy: string;
  onSortChange: (value: "RELEVANT" | "NEWEST" | "PRICE_ASC" | "PRICE_DESC") => void;
  sortOptions: Array<{
    value: string;
    label: string;
  }>;
}

export function ListingsResultsHeader({
  count,
  sortBy,
  onSortChange,
  sortOptions,
}: ListingsResultsHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#e7e3dc] pb-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-[34px] font-semibold tracking-[-0.05em] text-[#202124]">
        {count} relojes encontrados
      </h2>

      <label className="flex items-center gap-2 text-sm text-[#7a766f]">
        <span>Ordenar:</span>
        <select
          value={sortBy}
          onChange={(event) =>
            onSortChange(
              event.target.value as "RELEVANT" | "NEWEST" | "PRICE_ASC" | "PRICE_DESC",
            )
          }
          className="rounded-full border border-transparent bg-transparent pr-2 font-medium text-[#5c5954] focus-visible:outline-none"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
