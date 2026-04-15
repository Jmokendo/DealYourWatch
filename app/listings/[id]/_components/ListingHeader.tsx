import type { ListingDetail } from "@/lib/api/contracts";

interface Props {
  listing: ListingDetail;
}

export function ListingHeader({ listing }: Props) {
  const isVerified = listing.status === "APPROVED";

  const subtitleParts: string[] = [];
  if (listing.model.reference) subtitleParts.push(`Ref. ${listing.model.reference}`);
  if (listing.hasBox && listing.hasPapers) subtitleParts.push("Full set");
  else if (listing.hasBox) subtitleParts.push("Caja incluida");
  else if (listing.hasPapers) subtitleParts.push("Papeles incluidos");

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          {listing.model.brand.name}
        </span>
        {isVerified ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M2 6l3 3 5-5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Verificado
          </span>
        ) : null}
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
        {listing.title}
      </h1>

      {subtitleParts.length > 0 ? (
        <p className="text-sm text-zinc-400">{subtitleParts.join(" · ")}</p>
      ) : null}
    </div>
  );
}
