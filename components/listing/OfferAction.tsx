"use client";

import { Button } from "@/components/ui/button";

export type OfferState =
  | "HAS_NEGOTIATION"
  | "UNAUTHENTICATED"
  | "OWNER"
  | "CAN_OFFER";

interface OfferActionProps {
  busy: boolean;
  offerState: OfferState;
  priceLabel: string;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
  offersCount?: number;
  bestOfferLabel?: string;
  bestOfferPercent?: number;
  watchers?: number;
  existingNegotiationStatus?: string;
}

export function OfferAction({
  busy,
  offerState,
  priceLabel,
  onPrimaryAction,
  onSecondaryAction,
  offersCount,
  bestOfferLabel,
  bestOfferPercent,
  watchers,
  existingNegotiationStatus,
}: OfferActionProps) {
  const hasActiveOffers = typeof offersCount === "number" && offersCount > 0;
  const isNoOffers = typeof offersCount === "number" && offersCount === 0;

  const renderActionContent = () => {
    switch (offerState) {
      case "OWNER":
        return (
          <div className="rounded-[20px] border border-zinc-200 bg-white p-5 text-sm text-zinc-600">
            <p className="font-semibold text-zinc-900">Este es tu listado</p>
            <p className="mt-2">Las acciones de comprador no se muestran para este anuncio.</p>
          </div>
        );
      case "UNAUTHENTICATED":
        return (
          <div className="space-y-5">
            <div className="space-y-2 rounded-[20px] border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
              <p className="font-semibold text-zinc-900">Inicia sesión para negociar</p>
              <p>Necesitas una cuenta para iniciar una nueva negociación.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="default"
                size="lg"
                className="w-full"
                onClick={onPrimaryAction}
                disabled={busy}
              >
                {busy ? "Procesando..." : "Iniciar sesión"}
              </Button>
            </div>
          </div>
        );
      case "HAS_NEGOTIATION":
        return (
          <div className="space-y-5">
            <div className="space-y-2 rounded-[20px] border border-zinc-200 bg-white p-5 text-sm text-zinc-600">
              <p className="font-semibold text-zinc-900">Hay una negociación activa</p>
              <p>
                {existingNegotiationStatus
                  ? `Estado actual: ${existingNegotiationStatus}.`
                  : "Ya tienes una negociación abierta en este anuncio."}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="default"
                size="lg"
                className="w-full"
                onClick={onPrimaryAction}
                disabled={busy}
              >
                {busy ? "Procesando..." : `Comprar ahora — ${priceLabel}`}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full border-zinc-300 text-zinc-900 transition hover:border-zinc-900 hover:bg-zinc-50"
                onClick={onSecondaryAction}
                disabled={busy}
              >
                {busy ? "Procesando..." : "Hacer oferta"}
              </Button>
            </div>
          </div>
        );
      case "CAN_OFFER":
        return (
          <div className="space-y-5">
            {hasActiveOffers ? (
              <div className="rounded-[24px] border border-amber-100 bg-amber-50 p-4 text-sm text-zinc-700 shadow-sm transition duration-200">
                <p className="text-sm font-semibold text-zinc-950">Hay actividad en este listing</p>
                <div className="mt-3 space-y-2 text-sm leading-6">
                  <p>{watchers ?? 0} personas están viendo esto ahora</p>
                  <p>{offersCount ?? 0} ofertas recibidas</p>
                  <p className="flex flex-wrap items-center gap-2">
                    Mejor oferta actual:
                    <span className="inline-flex rounded-full bg-zinc-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-white">
                      {bestOfferLabel}
                    </span>
                    {typeof bestOfferPercent === "number" ? (
                      <span className="text-zinc-600">({bestOfferPercent}%)</span>
                    ) : null}
                  </p>
                </div>
              </div>
            ) : isNoOffers ? (
              <div className="space-y-4 rounded-[24px] border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-zinc-900">Sé el primero en hacer una oferta</p>
                  <p className="text-sm leading-6 text-zinc-600">
                    El vendedor acepta negociación. Las ofertas tienen justificación obligatoria.
                  </p>
                </div>
                <div className="rounded-[20px] border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                  Sé el primero en negociar este precio
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-zinc-900">Sé el primero en hacer una oferta</p>
                <p className="text-sm leading-6 text-zinc-600">
                  Envía tu oferta o compra ahora con total seguridad en nuestra plataforma.
                </p>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="default"
                size="lg"
                className="w-full"
                onClick={onPrimaryAction}
                disabled={busy}
              >
                {busy ? "Procesando..." : `Comprar ahora — ${priceLabel}`}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full border-zinc-300 text-zinc-900 transition hover:border-zinc-900 hover:bg-zinc-50"
                onClick={onSecondaryAction}
                disabled={busy}
              >
                {busy ? "Procesando..." : isNoOffers ? "Hacer primera oferta" : "Hacer oferta"}
              </Button>
            </div>

            <p className="text-xs leading-5 text-zinc-500">
              {isNoOffers
                ? "Sin compromiso. Puedes retirar tu oferta en cualquier momento"
                : hasActiveOffers
                ? "Acción rápida: la mejor oferta puede ser aceptada pronto"
                : "Sin compromiso. Revisa el estado de tu oferta cuando quieras y recibe actualizaciones desde tu panel."}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return <div>{renderActionContent()}</div>;
}
