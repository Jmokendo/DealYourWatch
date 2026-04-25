import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { UserProfileViewModel } from "@/components/users/types";

interface UserProfileStatsPanelProps {
  profile: UserProfileViewModel;
}

export function UserProfileStatsPanel({ profile }: UserProfileStatsPanelProps) {
  const stats = [
    { label: "Ventas", value: String(profile.stats.soldListings) },
    { label: "Resenas", value: profile.stats.reviewCount === null ? "--" : String(profile.stats.reviewCount) },
    { label: "Listings activos", value: String(profile.stats.activeListings) },
    { label: "Respuesta", value: profile.stats.responseRate === null ? "--" : `${profile.stats.responseRate}%` },
  ];

  return (
    <section className="flex w-full max-w-[500px] flex-col gap-8">
      <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="text-[25px] text-[#8d9098]">{stat.label}</dt>
            <dd className="text-[58px] font-semibold leading-none tracking-[-0.05em] text-[#202124]">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-4 sm:items-end">
        {profile.isOwner ? (
          <Button asChild className="h-12 min-w-[180px] rounded-full bg-[#191a20] px-7 text-[29px] font-medium hover:bg-[#262830]">
            <Link href="/me">Ir a mi perfil</Link>
          </Button>
        ) : (
          <Button asChild className="h-12 min-w-[180px] rounded-full bg-[#191a20] px-7 text-[29px] font-medium hover:bg-[#262830]">
            <Link href="/contact">Contactar</Link>
          </Button>
        )}

        <Button variant="ghost" className="h-auto p-0 text-[31px] font-normal text-[#202124] hover:bg-transparent hover:text-[#0f1015]">
          Reportar
        </Button>
      </div>
    </section>
  );
}

