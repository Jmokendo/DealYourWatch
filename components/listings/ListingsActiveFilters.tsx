interface ListingsActiveFiltersProps {
  filters: Array<{
    key: string;
    label: string;
    onRemove: () => void;
  }>;
  onClear: () => void;
}

export function ListingsActiveFilters({
  filters,
  onClear,
}: ListingsActiveFiltersProps) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <button
          key={filter.key}
          type="button"
          onClick={filter.onRemove}
          className="inline-flex items-center rounded-full border border-[#2f66ea] bg-white px-3 py-1.5 text-sm text-[#2147b1]"
        >
          {filter.label} x
        </button>
      ))}

      <button
        type="button"
        onClick={onClear}
        className="text-sm text-[#a19c94] transition hover:text-[#1d1d21]"
      >
        Limpiar filtros
      </button>
    </div>
  );
}
