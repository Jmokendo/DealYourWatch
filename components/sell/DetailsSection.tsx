import type { ReactNode } from "react";

interface DetailsSectionProps {
  brandSelect: ReactNode;
  titleField: ReactNode;
  referencePlaceholder: ReactNode;
  descriptionField: ReactNode;
}

export function DetailsSection({
  brandSelect,
  titleField,
  referencePlaceholder,
  descriptionField,
}: DetailsSectionProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {brandSelect}
      {titleField}
      {referencePlaceholder}
      <div className="rounded-[16px] border border-dashed border-[#ded9d2] bg-[#faf9f6] p-4 text-sm text-[#8f8a83]">
        Campo visual inspirado en el diseño. El backend actual no recibe referencia separada, asi que usalo dentro del titulo o la descripcion.
      </div>
      {descriptionField}
    </div>
  );
}
