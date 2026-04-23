"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { href: "/listings", label: "Explorar" },
  { href: "/sell", label: "Vender" },
  { href: "/#brands", label: "Marcas" },
];

export default function HomeNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.08] bg-[#f6f5f2]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="h-6 w-6 rounded-[7px] bg-[#111111]" />
          <span className="text-base font-semibold tracking-[-0.03em] text-[#202020]">
            DealYourWatch
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[13px] font-medium text-[#545454] transition-colors hover:text-[#111111]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="inline-flex h-9 items-center rounded-full border border-[#1c1c1c]/20 bg-white px-4 text-[13px] font-semibold text-[#1b1b1b] transition hover:border-[#111111] hover:bg-[#f0f0ec]"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/sell"
            className="inline-flex h-9 items-center rounded-full bg-[#111111] px-4 text-[13px] font-semibold text-white transition hover:bg-[#2b2b2b]"
          >
            Vender
          </Link>
        </div>

        <button
          className="p-1 text-[#111111] md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-black/[0.08] bg-[#f6f5f2] px-5 pb-5 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-2xl px-3 py-3 text-sm text-[#454545] transition hover:bg-white hover:text-[#111111]"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#1c1c1c]/20 bg-white text-sm font-semibold text-[#111111]"
              onClick={() => setOpen(false)}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/sell"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#111111] text-sm font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              Vender
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
