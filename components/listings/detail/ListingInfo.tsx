import type { ListingDetail } from "@/lib/api/contracts";
import { formatMoney } from "@/lib/marketplace-ui";

interface ListingInfoProps {
  listing: ListingDetail;
}

export function ListingInfo({ listing }: ListingInfoProps) {
  return (
    <section className="border-b border-[#e7e3dc] pb-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8d8880]">
        {listing.model.brand.name}
      </p>

      <h1 className="mt-2 text-[40px] font-semibold leading-[1.02] tracking-[-0.06em] text-[#202124] sm:text-[54px]">
        {listing.model.name}
      </h1>

      <div className="mt-4 inline-flex items-center rounded-full border border-[#00b67a] bg-[#effcf6] px-4 py-1.5 text-sm font-medium text-[#00a86b]">
        ✓ Verificado
      </div>

      <div className="mt-6">
        <p className="text-[52px] font-semibold leading-none tracking-[-0.06em] text-[#1e1f22]">
          {formatMoney(listing.price, listing.currency)}
        </p>
        <p className="mt-2 text-[15px] text-[#9a958d]">Precio listado</p>
      </div>
    </section>
  );
}
