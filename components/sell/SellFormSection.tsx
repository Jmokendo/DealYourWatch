import type { ReactNode } from "react";

interface SellFormSectionProps {
  step: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function SellFormSection({
  step,
  title,
  description,
  children,
}: SellFormSectionProps) {
  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#aaa59d]">
          Paso {step}
        </p>
        <h2 className="text-[22px] font-semibold tracking-[-0.05em] text-[#1f1f22] sm:text-[26px]">
          {title}
        </h2>
        <p className="text-[15px] text-[#97928a]">{description}</p>
      </div>
      {children}
    </section>
  );
}
