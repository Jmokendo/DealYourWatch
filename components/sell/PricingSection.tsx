import type { ReactNode } from "react";

interface PricingSectionProps {
  priceInput: ReactNode;
}

export function PricingSection({ priceInput }: PricingSectionProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <div>{priceInput}</div>

      <div className="rounded-[18px] border border-[#e1ddd7] bg-[#faf9f6] p-5">
        <p className="text-sm font-semibold text-[#25252a]">Visibilidad del listing</p>
        <p className="mt-2 text-sm leading-6 text-[#8d8880]">
          Tu publicacion quedara en revision antes de aparecer en el marketplace. No agregamos campos nuevos de visibilidad porque el backend actual no los recibe.
        </p>
      </div>
    </div>
  );
}
