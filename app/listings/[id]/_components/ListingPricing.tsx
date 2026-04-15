import { formatMoney } from "@/lib/marketplace-ui";

interface Props {
  price: string;
  currency: string;
}

export function ListingPricing({ price, currency }: Props) {
  return (
    <div className="space-y-0.5">
      <p className="text-4xl font-bold tracking-tight text-zinc-950">
        {formatMoney(price, currency)}
      </p>
      <p className="text-sm text-zinc-500">Precio listado · Acepta ofertas</p>
    </div>
  );
}
