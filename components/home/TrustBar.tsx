import { Check } from "lucide-react";

const ITEMS = [
  "Autenticación experta",
  "Pago en escrow",
  "Envío asegurado",
  "Soporte humano",
];

export default function TrustBar() {
  return (
    <section className="border-t border-[#e8e4de] bg-white px-5 py-6 sm:px-8">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-x-10 gap-y-3">
        {ITEMS.map((item) => (
          <span key={item} className="flex items-center gap-2 text-sm font-medium text-[#5f5b55]">
            <Check className="h-3.5 w-3.5 text-[#8d8a84]" />
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
