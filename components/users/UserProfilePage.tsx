import Link from "next/link";
import { UserProfileHeader } from "@/components/users/UserProfileHeader";
import { UserProfileStatsPanel } from "@/components/users/UserProfileStats";
import { UserListingsGrid } from "@/components/users/UserListingsGrid";
import { UserProfileEmptyState } from "@/components/users/UserProfileEmptyState";
import type { UserProfileViewModel } from "@/components/users/types";

interface UserProfilePageProps {
  profile: UserProfileViewModel;
}

export function UserProfilePage({ profile }: UserProfilePageProps) {
  const listingsToRender = [...profile.activeListings, ...profile.soldListings];

  return (
    <main className="min-h-screen bg-[#f2f2f2] text-[#1f2023]">
      <header className="border-b border-[#d9d9dc] bg-[#f2f2f2]">
        <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <p className="text-[34px] font-semibold uppercase tracking-[-0.06em]">WATCHS</p>
          <Link href="/listings" className="text-[31px] text-[#787a83] transition hover:text-[#202124]">
            {"<- Volver al listing"}
          </Link>
        </div>
      </header>

      <section className="border-b border-[#d9d9dc] bg-[#ededee]">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10 xl:flex-row xl:items-start xl:justify-between">
          <UserProfileHeader profile={profile} />
          <UserProfileStatsPanel profile={profile} />
        </div>
      </section>

      <section className="border-b border-[#d9d9dc] bg-[#f2f2f2]">
        <div className="mx-auto flex w-full max-w-[1240px] items-center gap-10 px-5 sm:px-8 lg:px-10">
          <button
            type="button"
            className="border-b-[3px] border-[#23242a] px-2 py-4 text-[33px] font-semibold text-[#202124]"
            aria-current="page"
          >
            Listings activos ({profile.stats.activeListings})
          </button>
          <div className="px-2 py-4 text-[33px] text-[#9a9da5]">Resenas ({profile.stats.reviewCount ?? 0})</div>
          <div className="px-2 py-4 text-[33px] text-[#9a9da5]">Sobre el vendedor</div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-5 py-5 sm:px-8 lg:px-10">
        {listingsToRender.length > 0 ? (
          <UserListingsGrid listings={listingsToRender} />
        ) : (
          <UserProfileEmptyState isOwner={profile.isOwner} />
        )}
      </section>
    </main>
  );
}

