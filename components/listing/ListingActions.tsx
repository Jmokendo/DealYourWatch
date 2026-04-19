"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OfferAction, type OfferState } from "./OfferAction";
import type { NegotiationSummary } from "@/lib/api/contracts";
import { getNegotiationStatusLabel } from "@/lib/marketplace-ui";
import { createLoginRedirectUrl } from "@/lib/auth-utils";

export type NegotiationState =
  | { status: "loaded"; negotiation?: NegotiationSummary }
  | { status: "error"; reason: string };

function getOfferState(
  negotiationState: NegotiationState,
  isOwner: boolean,
  isAuthenticated: boolean,
): OfferState {
  if (isOwner) return "OWNER";
  if (!isAuthenticated) return "UNAUTHENTICATED";
  if (negotiationState.status === "loaded" && negotiationState.negotiation) {
    return "HAS_NEGOTIATION";
  }
  return "CAN_OFFER";
}

interface ListingActionsProps {
  listingId: string;
  negotiationState: NegotiationState;
  isOwner: boolean;
  isAuthenticated: boolean;
  priceLabel: string;
  offersCount?: number;
  bestOffer?: string;
  bestOfferPercent?: number;
  watchers?: number;
}

export default function ListingActions({
  listingId,
  negotiationState,
  isOwner,
  isAuthenticated,
  priceLabel,
  offersCount,
  bestOffer,
  bestOfferPercent,
  watchers,
}: ListingActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const offerState = getOfferState(negotiationState, isOwner, isAuthenticated);
  const existingNegotiation =
    negotiationState.status === "loaded" ? negotiationState.negotiation : undefined;
  const hasAcceptedOffer =
    existingNegotiation?.status === "ACCEPTED" ||
    existingNegotiation?.status === "CLOSED";
  const hasActiveOffers = typeof offersCount === "number" && offersCount > 0;
  const isNoOffers = typeof offersCount === "number" && offersCount === 0;
  const bestOfferLabel = bestOffer ?? "--";

  async function startNegotiation() {
    if (offerState === "UNAUTHENTICATED") {
      router.push(createLoginRedirectUrl(pathname));
      return;
    }

    setBusy(true);
    setError(null);
    setInfo(null);

    try {
      const res = await fetch(`/api/listings/${listingId}/negotiations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "We couldn't start a negotiation for this listing.");
        return;
      }

      const result = (await res.json()) as { id: string };
      setInfo("Negotiation started. Opening your offer flow...");
      router.push(`/negotiations/${result.id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5 rounded-[20px] border border-zinc-200 p-5 transition bg-white">
      {negotiationState.status === "error" ? (
        <div className="rounded-[20px] border border-amber-200 bg-amber-50 px-6 py-5 text-sm text-amber-900" role="alert">
          {negotiationState.reason}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-[20px] border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700" role="alert">
          {error}
        </div>
      ) : null}
      {info ? (
        <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-6 py-5 text-sm text-emerald-700">
          {info}
        </div>
      ) : null}

      <OfferAction
        busy={busy}
        offerState={offerState}
        priceLabel={priceLabel}
        onPrimaryAction={startNegotiation}
        onSecondaryAction={startNegotiation}
        offersCount={offersCount}
        bestOfferLabel={bestOfferLabel}
        bestOfferPercent={bestOfferPercent}
        watchers={watchers}
        existingNegotiationStatus={
          existingNegotiation ? getNegotiationStatusLabel(existingNegotiation.status) : undefined
        }
      />
    </div>
  );
}
