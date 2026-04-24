import Link from "next/link";
import { Check } from "lucide-react";

interface Listing {
  id: number;
  brand: string;
  model: string;
  year: number;
  condition: string;
  price: string;
  offersCount: number | null;
  verified: boolean;
}

const LISTINGS: Listing[] = [
  {
    id: 1,
    brand: "ROLEX",
    model: "Submariner 16610",
    year: 2019,
    condition: "Full set",
    price: "USD 13.900",
    offersCount: null,
    verified: true,
  },
  {
    id: 2,
    brand: "OMEGA",
    model: "Speedmaster MK40",
    year: 2021,
    condition: "Sin caja",
    price: "USD 6.400",
    offersCount: null,
    verified: true,
  },
  {
    id: 3,
    brand: "PATEK",
    model: "Aquanaut 5167A",
    year: 2020,
    condition: "Full set",
    price: "USD 48.000",
    offersCount: null,
    verified: true,
  },
  {
    id: 4,
    brand: "IWC",
    model: "Big Pilot 43",
    year: 2022,
    condition: "Full set",
    price: "USD 9.800",
    offersCount: 3,
    verified: true,
  },
  {
    id: 5,
    brand: "AP",
    model: "Royal Oak 15500",
    year: 2019,
    condition: "Full set",
    price: "USD 52.000",
    offersCount: 5,
    verified: true,
  },
  {
    id: 6,
    brand: "CARTIER",
    model: "Tank Solo XL",
    year: 2021,
    condition: "Caja y papeles",
    price: "USD 4.200",
    offersCount: null,
    verified: true,
  },
  {
    id: 7,
    brand: "GRAND SEIKO",
    model: "SBGA413",
    year: 2022,
    condition: "Full set",
    price: "USD 3.800",
    offersCount: null,
    verified: true,
  },
  {
    id: 8,
    brand: "TUDOR",
    model: "Black Bay 58",
    year: 2023,
    condition: "Full set",
    price: "USD 3.200",
    offersCount: 4,
    verified: true,
  },
];

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[18px] border border-[#e8e4de] bg-white shadow-[0_1px_0_rgba(17,17,17,0.02)]">
      <div className="relative aspect-[1.08/1] bg-[#e9e7e3]">
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <span className="flex items-center gap-1 rounded-full bg-[#111111] px-2 py-1 text-[10px] font-semibold text-white">
            <Check className="h-2.5 w-2.5" />
            Verificado
          </span>
          {listing.offersCount ? (
            <span className="rounded-full border border-[#ffb3b3] bg-white px-2 py-1 text-[10px] font-semibold text-[#ff5f5f]">
              {listing.offersCount} ofertas
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a3a09b]">
          {listing.brand}
        </p>
        <p className="mt-1 text-[21px] font-semibold leading-[1.12] tracking-[-0.04em] text-[#141414]">
          {listing.model}
        </p>
        <p className="mt-1 text-xs text-[#8d8a84]">
          {listing.year} · {listing.condition}
        </p>
        <p className="mt-2 text-[18px] font-semibold tracking-[-0.03em] text-[#161616]">
          {listing.price}
        </p>
        <Link
          href="/listings"
          className="mt-4 inline-flex h-9 w-fit items-center rounded-full bg-[#111111] px-4 text-xs font-semibold text-white transition hover:bg-[#2a2a2a]"
        >
          Ver detalle
        </Link>
      </div>
    </article>
  );
}

export default function NewArrivalsSection() {
  return (
    <section id="new-arrivals" className="bg-white px-5 py-16 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[34px] font-semibold tracking-[-0.055em] text-[#151515] sm:text-[48px]">
              Recién llegados
            </h2>
            <p className="mt-2 text-sm text-[#8f8b85]">
              Piezas verificadas, publicadas esta semana.
            </p>
          </div>

          <Link
            href="/listings"
            className="hidden text-sm font-semibold text-[#3d3d3d] transition hover:text-[#111111] sm:inline-flex"
          >
            Ver todos &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {LISTINGS.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>

        <Link
          href="/listings"
          className="mt-6 inline-flex text-sm font-semibold text-[#3d3d3d] transition hover:text-[#111111] sm:hidden"
        >
          Ver todos &rarr;
        </Link>
      </div>
    </section>
  );
}
