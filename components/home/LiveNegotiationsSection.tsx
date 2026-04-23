import Link from "next/link";

interface NegotiationCard {
  id: number;
  brand: string;
  model: string;
  askPrice: string;
  lastOffer: string;
  timeAgo: string;
  offersCount: number;
}

const NEGOTIATIONS: NegotiationCard[] = [
  {
    id: 1,
    brand: "ROLEX",
    model: "Submariner 16610",
    askPrice: "USD 13.900",
    lastOffer: "USD 12.500",
    timeAgo: "hace 2h",
    offersCount: 4,
  },
  {
    id: 2,
    brand: "AP",
    model: "Royal Oak 15500",
    askPrice: "USD 52.000",
    lastOffer: "USD 48.750",
    timeAgo: "hace 40min",
    offersCount: 7,
  },
  {
    id: 3,
    brand: "PATEK",
    model: "Aquanaut 5167A",
    askPrice: "USD 48.000",
    lastOffer: "USD 44.000",
    timeAgo: "hace 6h",
    offersCount: 3,
  },
  {
    id: 4,
    brand: "TUDOR",
    model: "Black Bay 58",
    askPrice: "USD 3.200",
    lastOffer: "USD 2.900",
    timeAgo: "hace 15min",
    offersCount: 5,
  },
];

function NegCard({ card }: { card: NegotiationCard }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[18px] border border-[#e8e4de] bg-white">
      <div className="relative aspect-[1.08/1] bg-[#e9e7e3]">
        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#111111] px-2.5 py-1 text-[10px] font-semibold text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff4d4d]" />
          LIVE
        </span>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a3a09b]">
          {card.brand}
        </p>
        <p className="mt-1 text-[20px] font-semibold leading-[1.12] tracking-[-0.04em] text-[#171717]">
          {card.model}
        </p>

        <div className="mt-4 space-y-3 border-t border-[#efede8] pt-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#b1ada6]">
              Precio inicial
            </p>
            <p className="mt-1 text-sm font-medium text-[#78756f]">
              {card.askPrice}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#b1ada6]">
              Última oferta
            </p>
            <p className="mt-1 text-[18px] font-semibold tracking-[-0.03em] text-[#1f9a4a]">
              {card.lastOffer}
            </p>
          </div>
        </div>

        <p className="mt-3 text-[10px] text-[#9b978f]">
          {card.timeAgo} · {card.offersCount} ofertas
        </p>

        <Link
          href="/listings"
          className="mt-4 inline-flex h-9 w-fit items-center rounded-full border border-[#1f1f1f]/20 px-4 text-xs font-semibold text-[#1b1b1b] transition hover:border-[#111111] hover:bg-[#faf9f5]"
        >
          Ver negociación &rarr;
        </Link>
      </div>
    </article>
  );
}

export default function LiveNegotiationsSection() {
  return (
    <section className="bg-[#f6f5f2] px-5 py-[4.5rem] sm:px-8 lg:py-24">
      <div className="mx-auto max-w-[1280px]">
        <h2 className="text-[34px] font-semibold tracking-[-0.055em] text-[#151515] sm:text-[48px]">
          Negociaciones activas ahora
        </h2>
        <p className="mb-8 mt-2 text-sm text-[#8f8b85]">
          Mirá lo que se está moviendo en este momento.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {NEGOTIATIONS.map((card) => (
            <NegCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
