import type { ReactNode } from "react";

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface ListingsSidebarProps {
  brands: Array<{ label: string; count: number }>;
  activeBrand: string;
  onBrandChange: (value: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  conditions: FilterOption[];
  activeCondition: string;
  onConditionChange: (value: string) => void;
  accessories: FilterOption[];
  activeAccessory: string;
  onAccessoryChange: (value: string) => void;
  years: FilterOption[];
  activeYear: string;
  onYearChange: (value: string) => void;
  onApplyFilters: () => void;
}

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-[#e7e3dc] pt-4">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9f9b94]">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function CheckboxList({
  items,
  activeValue,
  onChange,
}: {
  items: FilterOption[];
  activeValue: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const active = activeValue === item.value;

        return (
          <label
            key={item.value}
            className="flex cursor-pointer items-center justify-between gap-3 text-sm text-[#434246]"
          >
            <span className="flex items-center gap-3">
              <span
                className={
                  active
                    ? "flex h-5 w-5 items-center justify-center rounded-[5px] bg-[#1d1d21] text-[10px] text-white"
                    : "block h-5 w-5 rounded-[5px] border border-[#d9d5cf] bg-white"
                }
              >
                {active ? "ok" : null}
              </span>
              <input
                type="checkbox"
                checked={active}
                onChange={() => onChange(active ? "" : item.value)}
                className="sr-only"
              />
              <span>{item.label}</span>
            </span>
            <span className="text-[#9c978f]">{item.count}</span>
          </label>
        );
      })}
    </div>
  );
}

function RadioList({
  items,
  activeValue,
  onChange,
}: {
  items: FilterOption[];
  activeValue: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const active = activeValue === item.value;

        return (
          <label
            key={item.value}
            className="flex cursor-pointer items-center justify-between gap-3 text-sm text-[#434246]"
          >
            <span className="flex items-center gap-3">
              <span
                className={
                  active
                    ? "block h-5 w-5 rounded-full border-[5px] border-[#1d1d21] bg-white"
                    : "block h-5 w-5 rounded-full border border-[#d9d5cf] bg-white"
                }
              />
              <input
                type="radio"
                checked={active}
                onChange={() => onChange(item.value)}
                className="sr-only"
              />
              <span>{item.label}</span>
            </span>
            <span className="text-[#9c978f]">{item.count}</span>
          </label>
        );
      })}
    </div>
  );
}

export function ListingsSidebar({
  brands,
  activeBrand,
  onBrandChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  conditions,
  activeCondition,
  onConditionChange,
  accessories,
  activeAccessory,
  onAccessoryChange,
  years,
  activeYear,
  onYearChange,
  onApplyFilters,
}: ListingsSidebarProps) {
  return (
    <aside className="rounded-[22px] border border-[#ddd8d1] bg-white p-4 lg:sticky lg:top-5">
      <div className="space-y-4">
        <h2 className="text-[18px] font-semibold tracking-[-0.04em] text-[#202124]">
          Filtros
        </h2>

        <button
          type="button"
          onClick={onApplyFilters}
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#1d1d21] text-base font-semibold text-white"
        >
          Aplicar filtros
        </button>
      </div>

      <div className="mt-4 space-y-4">
        <SidebarSection title="Marca">
          <CheckboxList
            items={brands.map((brand) => ({
              value: brand.label,
              label: brand.label,
              count: brand.count,
            }))}
            activeValue={activeBrand === "Todos" ? "" : activeBrand}
            onChange={(value) => onBrandChange(value || "Todos")}
          />
        </SidebarSection>

        <SidebarSection title="Precio">
          <div className="grid grid-cols-2 gap-3">
            <label className="overflow-hidden rounded-[14px] border border-[#ddd8d1] bg-[#faf9f6]">
              <span className="inline-flex h-full items-center border-r border-[#ddd8d1] bg-[#f1efeb] px-4 text-sm text-[#6a6761]">
                $
              </span>
              <input
                value={minPrice}
                onChange={(event) => onMinPriceChange(event.target.value)}
                inputMode="numeric"
                placeholder="10.000"
                className="w-[calc(100%-44px)] bg-transparent px-3 py-3 text-sm text-[#202124] outline-none"
              />
            </label>
            <label className="overflow-hidden rounded-[14px] border border-[#ddd8d1] bg-[#faf9f6]">
              <span className="inline-flex h-full items-center border-r border-[#ddd8d1] bg-[#f1efeb] px-4 text-sm text-[#6a6761]">
                $
              </span>
              <input
                value={maxPrice}
                onChange={(event) => onMaxPriceChange(event.target.value)}
                inputMode="numeric"
                placeholder="20.000"
                className="w-[calc(100%-44px)] bg-transparent px-3 py-3 text-sm text-[#202124] outline-none"
              />
            </label>
          </div>
        </SidebarSection>

        <SidebarSection title="Estado">
          <CheckboxList
            items={conditions}
            activeValue={activeCondition}
            onChange={onConditionChange}
          />
        </SidebarSection>

        <SidebarSection title="Accesorios">
          <CheckboxList
            items={accessories}
            activeValue={activeAccessory}
            onChange={onAccessoryChange}
          />
        </SidebarSection>

        <SidebarSection title="Ano">
          <RadioList
            items={years}
            activeValue={activeYear}
            onChange={onYearChange}
          />
        </SidebarSection>
      </div>
    </aside>
  );
}
