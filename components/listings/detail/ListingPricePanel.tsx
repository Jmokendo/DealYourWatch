"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { ListingDetail, NegotiationSummary } from "@/lib/api/contracts";
import { createLoginRedirectUrl } from "@/lib/auth-utils";
import { formatMoney, getNegotiationStatusLabel } from "@/lib/marketplace-ui";

type NegotiationState =
  | { status: "loaded"; negotiation?: NegotiationSummary }
  | { status: "error"; reason: string };

interface ListingPricePanelProps {
  listing: ListingDetail;
  negotiationState: NegotiationState;
  isOwner: boolean;
  isAuthenticated: boolean;
}

function getOfferSummary(
  negotiationState: NegotiationState,
  isOwner: boolean,
  isAuthenticated: boolean,
) {
  if (isOwner) {
    return {
      title: "Este es tu listing",
      description: "Las acciones de comprador no se muestran para tu propia publicacion.",
      footer: "Sin acciones disponibles para el vendedor en esta vista.",
    };
  }

  if (!isAuthenticated) {
    return {
      title: "Inicia sesion para negociar",
      description: "Necesitas una cuenta para comprar o enviar una primera oferta.",
      footer: "0 ofertas recibidas hasta ahora",
    };
  }

  if (negotiationState.status === "loaded" && negotiationState.negotiation) {
    return {
      title: "Ya tienes una negociacion activa",
      description: `Estado actual: ${getNegotiationStatusLabel(
        negotiationState.negotiation.status,
      )}. Puedes continuar el flujo desde la accion principal.`,
      footer: "1 negociacion abierta para este listing",
    };
  }

  return {
    title: "Se el primero en hacer una oferta",
    description:
      "El vendedor acepta negociacion. Las ofertas tienen justificacion obligatoria.",
    footer: "0 ofertas recibidas hasta ahora",
  };
}

export function ListingPricePanel({
  listing,
  negotiationState,
  isOwner,
  isAuthenticated,
}: ListingPricePanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priceLabel = formatMoney(listing.price, listing.currency);
  const summary = getOfferSummary(negotiationState, isOwner, isAuthenticated);

  async function startNegotiation() {
    if (isOwner) return;

    if (!isAuthenticated) {
      router.push(createLoginRedirectUrl(pathname));
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/listings/${listing.id}/negotiations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(body?.error ?? "No pudimos iniciar la negociacion.");
        return;
      }

      const result = (await response.json()) as { id: string };
      router.push(`/negotiations/${result.id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4 border-b border-[#e7e3dc] pb-6">
      {negotiationState.status === "error" ? (
        <div className="rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {negotiationState.reason}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9a958d]">
          Modulo de oferta
        </p>
      </div>

      <div className="rounded-[22px] border border-[#e3dfd8] bg-white p-5">
        <p className="text-[20px] font-semibold tracking-[-0.04em] text-[#303036]">
          {summary.title}
        </p>
        <p className="mt-2 text-[15px] leading-7 text-[#7f7b74]">
          {summary.description}
        </p>
        <p className="mt-4 text-[15px] text-[#b1aca4]">{summary.footer}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={startNegotiation}
          disabled={busy || isOwner}
          className="inline-flex h-13 items-center justify-center rounded-full bg-[#1d1d21] px-6 text-base font-semibold text-white transition hover:bg-[#2f2f34] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Procesando..." : `Comprar ahora — ${priceLabel}`}
        </button>

        <button
          type="button"
          onClick={startNegotiation}
          disabled={busy || isOwner}
          className="inline-flex h-13 items-center justify-center rounded-full border border-[#cbc6be] bg-white px-6 text-base font-medium text-[#202124] transition hover:border-[#1d1d21] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {negotiationState.status === "loaded" && negotiationState.negotiation
            ? "Continuar oferta"
            : "Hacer primera oferta"}
        </button>
      </div>

      <p className="text-sm text-[#8e8982]">
        Sin compromiso · el vendedor puede aceptar, rechazar o contra-ofertar
      </p>
    </section>
  );
}
