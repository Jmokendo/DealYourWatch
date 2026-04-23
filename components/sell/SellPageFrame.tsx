import Link from "next/link";
import type { ReactNode } from "react";

interface SellPageFrameProps {
  form: ReactNode;
}

export function SellPageFrame({ form }: SellPageFrameProps) {
  return (
    <main className="min-h-screen bg-[#f6f5f2] text-[#1d1d21]">
      <header className="border-b border-black/[0.08] bg-white">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="text-[18px] font-semibold tracking-[-0.04em] text-[#1d1d21]">
            DealYourWatch
          </Link>
          <h1 className="hidden text-[17px] font-semibold tracking-[-0.03em] text-[#1d1d21] sm:block">
            Publicar reloj
          </h1>
          <Link href="/" className="text-sm text-[#8e8a83] transition hover:text-[#1d1d21]">
            Cancelar
          </Link>
        </div>
      </header>

      {form}
    </main>
  );
}
