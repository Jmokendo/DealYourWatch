interface SellStepSidebarProps {
  title: string;
  brand: string;
  price: string;
  imageUrl: string;
  previewCondition: string;
  steps: {
    photos: boolean;
    data: boolean;
    condition: boolean;
    price: boolean;
  };
}

const STEP_ITEMS = [
  { id: 1, title: "Fotos", description: "Hasta 8 imagenes", key: "photos" },
  { id: 2, title: "Datos", description: "Marca, modelo, ref.", key: "data" },
  { id: 3, title: "Condicion", description: "Estado y accesorios", key: "condition" },
  { id: 4, title: "Precio", description: "Precio y visibilidad", key: "price" },
] as const;

export function SellStepSidebar({
  title,
  brand,
  price,
  imageUrl,
  previewCondition,
  steps,
}: SellStepSidebarProps) {
  const previewPrice =
    price && !Number.isNaN(Number(price))
      ? `USD ${new Intl.NumberFormat("en-US", {
          maximumFractionDigits: 0,
        }).format(Number(price))}`
      : "USD 0";

  return (
    <aside className="border-b border-[#e5e1da] bg-[#fbfaf8] px-6 py-8 lg:min-h-full lg:border-b-0 lg:border-r lg:px-6">
      <div className="space-y-8">
        <div>
          <h2 className="text-[18px] font-semibold tracking-[-0.04em] text-[#1f1f22]">
            Tu reloj
          </h2>
        </div>

        <ol className="space-y-5">
          {STEP_ITEMS.map((item, index) => {
            const completed = steps[item.key];

            return (
              <li key={item.id} className="relative flex gap-4">
                {index < STEP_ITEMS.length - 1 ? (
                  <span className="absolute left-[15px] top-10 h-12 w-px bg-[#dad5ce]" />
                ) : null}
                <span
                  className={completed
                    ? "relative z-10 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1d1d21] text-sm font-semibold text-white"
                    : "relative z-10 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0eeea] text-sm font-semibold text-[#a29d96]"}
                >
                  {item.id}
                </span>
                <div className="space-y-0.5 pt-0.5">
                  <p className="text-[15px] font-semibold text-[#303036]">{item.title}</p>
                  <p className="text-sm text-[#a29d96]">{item.description}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="border-t border-[#ddd8d1] pt-4">
          <p className="mb-3 text-sm text-[#9a958d]">Vista previa</p>
          <div className="overflow-hidden rounded-[20px] border border-[#e2ddd6] bg-white">
            <div className="relative aspect-[0.74/1] bg-[#f3f1ee]">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="Vista previa del reloj" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="h-12 w-12 rounded-[10px] bg-[#d9d7d2]" />
                </div>
              )}
            </div>
            <div className="space-y-1 px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#a7a299]">
                {brand}
              </p>
              <p className="text-[24px] font-semibold leading-[1.05] tracking-[-0.05em] text-[#1d1d21]">
                {title.trim() || "Modelo del reloj"}
              </p>
              <p className="text-sm text-[#9c978f]">Ano · {previewCondition}</p>
              <p className="pt-1 text-[18px] font-semibold text-[#d3d0ca]">{previewPrice}</p>
            </div>
            <div className="px-4 pb-4">
              <div className="flex h-9 items-center justify-center rounded-full bg-[#e8e5df] text-sm font-medium text-[#b5b0a8]">
                Ver detalle
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
