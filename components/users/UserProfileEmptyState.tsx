import Link from "next/link";

interface UserProfileEmptyStateProps {
  isOwner: boolean;
}

export function UserProfileEmptyState({ isOwner }: UserProfileEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[#d2d4da] bg-white px-6 py-10 text-center">
      <h2 className="text-2xl font-semibold tracking-tight text-[#222328]">Este usuario no tiene listings activos</h2>
      <p className="mt-2 text-sm text-[#7b7d86]">
        Cuando publique un reloj aprobado o vendido, se mostrara aqui.
      </p>

      <div className="mt-6 flex items-center justify-center gap-3">
        <Link
          href="/listings"
          className="inline-flex h-10 items-center justify-center rounded-full border border-[#d0d1d7] px-5 text-sm font-medium text-[#2b2d33] transition hover:border-[#9ea1ab]"
        >
          Ver marketplace
        </Link>
        {isOwner ? (
          <Link
            href="/sell"
            className="inline-flex h-10 items-center justify-center rounded-full bg-[#191a20] px-5 text-sm font-semibold text-white transition hover:bg-[#2a2c35]"
          >
            Publicar reloj
          </Link>
        ) : null}
      </div>
    </div>
  );
}

