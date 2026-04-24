const WATCH_WORDS = ["Rolex", "Patek", "AP"];

export function LoginShowcasePanel() {
  return (
    <aside className="relative hidden min-h-full overflow-hidden bg-[#1b1b1f] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-14 xl:py-16">
      <div>
        <p className="text-[22px] font-semibold tracking-[-0.04em] text-white">
          DealYourWatch
        </p>
        <p className="mt-3 max-w-xs text-[15px] leading-7 text-[#b3b0aa]">
          El marketplace de relojes de lujo en LATAM.
        </p>
      </div>

      <div className="pointer-events-none absolute inset-x-8 top-1/2 -translate-y-1/2 xl:inset-x-14">
        <div className="space-y-6">
          {WATCH_WORDS.map((word) => (
            <div
              key={word}
              className="text-[6rem] font-semibold leading-none tracking-[-0.08em] text-white/[0.04] xl:text-[7.5rem]"
            >
              {word}
            </div>
          ))}
        </div>
      </div>

      <div className="relative mt-16 border-t border-white/[0.16] pt-4 text-[15px] text-[#b3b0aa]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>1.200+ relojes verificados</span>
          <span>Argentina · Mexico · Chile · Colombia</span>
        </div>
      </div>
    </aside>
  );
}
