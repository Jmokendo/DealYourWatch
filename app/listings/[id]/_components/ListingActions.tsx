"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ListingDetail, NegotiationSummary } from "@/lib/api/contracts";
import { formatMoney, getNegotiationStatusLabel } from "@/lib/marketplace-ui";

interface Props {
  listing: ListingDetail;
  isOwner: boolean;
  existingNegotiation: NegotiationSummary | null;
  sessionStatus: "authenticated" | "unauthenticated" | "loading";
  busy: boolean;
  onMakeOffer: () => void;
}

export function ListingActions({
  listing,
  isOwner,
  existingNegotiation,
  sessionStatus,
  busy,
  onMakeOffer,
}: Props) {
  const priceLabel = formatMoney(listing.price, listing.currency);

  function offerAction() {
    if (existingNegotiation) {
      return (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-sm font-medium text-zinc-950">Ya iniciaste una negociación</p>
          <p className="mt-1 text-sm text-zinc-500">
            Estado: {getNegotiationStatusLabel(existingNegotiation.status)}
          </p>
          <Button variant="outline" className="mt-3 w-full rounded-full" asChild>
            <Link href={`/negotiations/${existingNegotiation.id}`}>Ver negociación</Link>
          </Button>
        </div>
      );
    }

    if (sessionStatus !== "authenticated") {
      return (
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="w-full rounded-full"
          asChild
        >
          <Link href="/login">Ingresar para ofertar</Link>
        </Button>
      );
    }

    if (isOwner) {
      return (
        <p className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-500">
          Sos el dueño de este listing.
        </p>
      );
    }

    return (
      <Button
        type="button"
        size="lg"
        variant="outline"
        className="w-full rounded-full"
        disabled={busy}
        onClick={onMakeOffer}
      >
        {busy ? "Iniciando..." : "Ofertar ahora"}
      </Button>
    );
  }

  return (
    <>
      {/* Desktop CTAs — hidden on mobile (replaced by fixed bar below) */}
      <div className="hidden flex-col gap-3 lg:flex">
        <Button
          type="button"
          size="lg"
          className="w-full cursor-not-allowed rounded-full opacity-40"
          disabled
        >
          Comprar ahora{" "}
          <span className="text-xs font-normal">(próximamente)</span>
        </Button>
        {offerAction()}
      </div>

      {/* Mobile fixed bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white px-4 py-3 lg:hidden">
        <div className="mx-auto flex max-w-lg flex-col gap-2">
          <Button
            type="button"
            size="lg"
            className="w-full cursor-not-allowed rounded-full opacity-40"
            disabled
          >
            Comprar ahora — {priceLabel}{" "}
            <span className="text-xs font-normal">(próximamente)</span>
          </Button>
          {offerAction()}
        </div>
      </div>
    </>
  );
}
