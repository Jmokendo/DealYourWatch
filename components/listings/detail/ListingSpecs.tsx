import type { ListingDetail } from "@/lib/api/contracts";
import { getConditionLabel } from "@/lib/marketplace-ui";

interface ListingSpecsProps {
  listing: ListingDetail;
}

function getAccessoriesLabel(listing: ListingDetail) {
  if (listing.hasBox && listing.hasPapers) return "Caja + papeles";
  if (listing.hasBox) return "Caja";
  if (listing.hasPapers) return "Papeles";
  return "Sin accesorios";
}

function getYearLabel(listing: ListingDetail) {
  return String(new Date(listing.createdAt).getFullYear());
}

export function ListingSpecs({ listing }: ListingSpecsProps) {
  const rows = [
    { label: "Año", value: getYearLabel(listing) },
    { label: "Calibre", value: "Placeholder backend" },
    { label: "Diámetro", value: "Placeholder backend" },
    { label: "Incluye", value: getAccessoriesLabel(listing) },
    { label: "Condición", value: getConditionLabel(listing.condition) },
  ];

  return (
    <section className="border-b border-[#e7e3dc] pb-6">
      <h2 className="text-[28px] font-semibold tracking-[-0.05em] text-[#202124]">
        Especificaciones
      </h2>

      <div className="mt-4 divide-y divide-[#efebe5]">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[180px_minmax(0,1fr)] gap-4 py-3">
            <p className="text-[15px] text-[#86827b]">{row.label}</p>
            <p className="text-[15px] font-medium text-[#232427]">{row.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
