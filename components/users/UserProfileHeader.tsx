import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { UserProfileViewModel } from "@/components/users/types";

interface UserProfileHeaderProps {
  profile: UserProfileViewModel;
}

export function UserProfileHeader({ profile }: UserProfileHeaderProps) {
  const ratingText =
    profile.stats.rating === null
      ? "-- / 5 (sin resenas)"
      : `${profile.stats.rating.toFixed(1)} / 5 (${profile.stats.reviewCount ?? 0} resenas)`;

  return (
    <section className="flex w-full max-w-[690px] flex-col gap-4">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#c9c9cf] text-4xl font-semibold text-[#43444a]">
          {profile.user.image ? (
            <Image
              src={profile.user.image}
              alt={profile.user.name}
              fill
              unoptimized
              sizes="128px"
              className="object-cover"
            />
          ) : (
            <span>{profile.user.initials}</span>
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-[58px] font-semibold tracking-[-0.06em] text-[#202124]">{profile.user.name}</h1>
          <p className="text-[31px] text-[#8b8e96]">
            {profile.user.memberSinceLabel} · {profile.user.locationLabel}
          </p>

          <div className="flex items-center gap-3 text-[#dc8200]">
            <div className="flex items-center gap-1" aria-hidden>
              {Array.from({ length: 5 }).map((_, index) => (
                <span
                  key={index}
                  className={`h-4 w-4 rounded ${index < 4 ? "bg-[#dc8200]" : "bg-[#d4d5db]"}`}
                />
              ))}
            </div>
            <p className="text-[31px] text-[#61636b]">{ratingText}</p>
          </div>
        </div>
      </div>

      <Badge className="h-8 w-fit rounded-full bg-[#dff7e9] px-4 text-[25px] font-medium text-[#0a9a4b] hover:bg-[#dff7e9]">
        {profile.user.verificationLabel}
      </Badge>
    </section>
  );
}

