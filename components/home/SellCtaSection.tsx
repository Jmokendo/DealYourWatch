import Link from "next/link";
import { Check } from "lucide-react";

const BULLETS = [
  "Tasación gratis basada en data de mercado",
  "Audiencia cualificada LATAM",
  "Sin cuota de publicación",
  "Cobrás en tu cuenta en menos de 48hs",
];

export default function SellCtaSection() {
  return (
    <section className="bg-[#111111] px-5 py-16 sm:px-8 lg:py-20">
      <div className="mx-auto grid max-w-[1280px] items-stretch gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7d7d7d]">
            Para vendedores
          </p>
          <h2 className="max-w-[520px] text-[36px] font-semibold leading-[1.02] tracking-[-0.055em] text-white sm:text-[52px]">
            Tu próxima venta
            <br />
            empieza acá.
          </h2>

          <ul className="mb-10 mt-8 space-y-3">
            {BULLETS.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-[#d2d0cb]">
                <Check className="h-4 w-4 shrink-0 text-[#d2d0cb]" />
                {item}
              </li>
            ))}
          </ul>

          <Link
            href="/sell"
            className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-[#111111] transition hover:bg-[#efefe8]"
          >
            Publicar mi reloj &rarr;
          </Link>
        </div>

        <div className="grid min-h-[280px] place-items-center rounded-[28px] border border-white/[0.08] bg-[linear-gradient(135deg,#181818_0%,#232323_48%,#111111_100%)] px-8">
          <div className="w-full max-w-[340px]">
            <div className="aspect-[1.05/1] rounded-[26px] border border-white/[0.08] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.07),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]" />
            <span className="mt-4 block text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-[#6f6f6f]">
              Hero reloj · Placeholder
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
