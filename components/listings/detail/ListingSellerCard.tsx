import Link from "next/link";
import type { UserPublic } from "@/lib/api/contracts";

interface ListingSellerCardProps {
  user: UserPublic;
}

export function ListingSellerCard({ user }: ListingSellerCardProps) {
  const label = user.name ?? user.email;
  const initials = label
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="flex flex-col gap-4 rounded-[22px] border border-[#e3dfd8] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#efede8] text-sm font-semibold text-[#5e5a54]">
          {initials}
        </div>
        <div>
          <p className="text-[22px] font-semibold tracking-[-0.04em] text-[#202124]">
            {label} · ⭐ 4.9 · 38 ventas
          </p>
          <p className="mt-1 text-[15px] text-[#8d8880]">
            Vendedor verificado · Miembro desde 2022
          </p>
        </div>
      </div>

      <Link
        href={`/users/${user.id}`}
        className="inline-flex h-10 items-center justify-center rounded-full border border-[#d2cdc6] bg-white px-5 text-sm font-medium text-[#26272b] transition hover:border-[#1d1d21]"
      >
        Ver perfil →
      </Link>
    </section>
  );
}
