import Link from "next/link";
import { Search } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="bg-[#151515] px-5 pb-24 pt-[4.5rem] sm:px-8 sm:pt-24 lg:pb-28 lg:pt-28">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex min-h-[410px] flex-col justify-center lg:min-h-[530px]">
          <p className="mb-7 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#7b7b7b]">
            El marketplace de relojes de lujo
          </p>

          <h1 className="max-w-[760px] text-[46px] font-semibold leading-[0.97] tracking-[-0.055em] text-white sm:text-[62px] lg:text-[72px]">
            Cada reloj cuenta una historia.
            <br />
            Encontra la tuya.
          </h1>

          <p className="mb-10 mt-7 max-w-[720px] text-sm font-medium text-[#9f9f9f] sm:text-[15px]">
            1.200+ piezas verificadas. Negociacion abierta. Compra protegida.
          </p>

          <form
            action="/listings"
            method="GET"
            className="mb-8 flex h-14 max-w-[590px] items-center gap-3 rounded-full border border-white/[0.12] bg-white/[0.07] px-5 text-sm text-[#7b7b7b] transition hover:border-white/[0.18] hover:bg-white/[0.10]"
          >
            <Search className="h-4 w-4 shrink-0 text-[#666666]" />
            <input
              type="search"
              name="q"
              placeholder="Buscar marca, modelo, referencia..."
              className="w-full bg-transparent text-white outline-none placeholder:text-[#7b7b7b]"
            />
            <button type="submit" className="sr-only">
              Buscar
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/listings"
              className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-[#111111] transition hover:bg-[#efefe8]"
            >
              Explorar relojes &rarr;
            </Link>
            <Link
              href="/sell"
              className="inline-flex h-11 items-center rounded-full border border-white/[0.35] px-5 text-sm font-semibold text-white transition hover:border-white/[0.60] hover:bg-white/[0.05]"
            >
              Vende tu reloj
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
