import Link from "next/link";

export function ListingsFeedHeader() {
  return (
    <header className="border-b border-black/[0.08] bg-white">
      <div className="mx-auto flex h-16 max-w-[1380px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-3">
          <span className="h-7 w-7 rounded-[9px] bg-[#111111]" />
          <span className="text-[15px] font-semibold tracking-[-0.03em] text-[#202020] sm:text-[18px]">
            DealYourWatch
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="inline-flex h-10 items-center rounded-full border border-[#d9d5cf] bg-white px-4 text-sm font-medium text-[#4a4a4d] transition hover:border-[#bdb6ae] hover:text-[#111111]"
          >
            Iniciar sesion
          </Link>
          <Link
            href="/sell"
            className="inline-flex h-10 items-center rounded-full bg-[#19191c] px-4 text-sm font-semibold text-white transition hover:bg-[#2a2a2d]"
          >
            Vender
          </Link>
        </div>
      </div>
    </header>
  );
}
