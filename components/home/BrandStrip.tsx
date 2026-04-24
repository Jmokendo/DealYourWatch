const BRANDS = [
  "Rolex",
  "Patek Philippe",
  "Audemars Piguet",
  "Omega",
  "IWC",
  "Cartier",
  "Tudor",
  "Grand Seiko",
];

export default function BrandStrip() {
  return (
    <section id="brands" className="bg-white px-5 py-14 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-[1280px]">
        <h2 className="mb-6 text-[32px] font-semibold tracking-[-0.05em] text-[#151515] sm:text-[44px]">
          Las casas que importan
        </h2>

        <div className="flex flex-wrap gap-2">
          {BRANDS.map((brand) => (
            <button
              key={brand}
              className="rounded-full border border-[#e7e4de] bg-[#fbfaf7] px-4 py-2 text-sm font-medium text-[#575757] transition-colors hover:border-[#c9c4bb] hover:text-[#111111]"
            >
              {brand}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
