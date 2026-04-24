import type { ReactNode } from "react";

interface ImageUploadSectionProps {
  uploader: ReactNode;
}

const PHOTO_TIPS = [
  "Fondo blanco o neutro",
  "Mostrar esfera, brazalete y caja",
  "Fotografiar cualquier raya o detalle",
  "Incluir foto con el numero de serie",
];

export function ImageUploadSection({ uploader }: ImageUploadSectionProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">{uploader}</div>

      <aside className="rounded-[20px] bg-[#eef4ff] p-6">
        <h3 className="text-[20px] font-semibold tracking-[-0.04em] text-[#23262d]">
          Consejos para mejores fotos
        </h3>
        <ul className="mt-5 space-y-5">
          {PHOTO_TIPS.map((tip) => (
            <li key={tip} className="flex gap-3 text-[15px] text-[#4e5664]">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#2f66ea]" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
