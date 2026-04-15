"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ListingDetail, NegotiationSummary } from "@/lib/api/contracts";
import { useSession } from "next-auth/react";
import { getConditionLabel } from "@/lib/marketplace-ui";
import { ListingGallery } from "./_components/ListingGallery";
import { ListingHeader } from "./_components/ListingHeader";
import { ListingPricing } from "./_components/ListingPricing";
import { ListingActions } from "./_components/ListingActions";

export default function ListingDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [existingNegotiation, setExistingNegotiation] =
    useState<NegotiationSummary | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      setError(null);
      const res = await fetch(`/api/listings/${id}`);
      if (!res.ok) {
        setError(
          res.status === 404
            ? "This listing could not be found."
            : "We couldn't load this listing right now.",
        );
        setListing(null);
        return;
      }
      const data = (await res.json()) as ListingDetail;
      setListing(data);
    } catch {
      setError("We couldn't load this listing right now.");
      setListing(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [listing?.id]);

  useEffect(() => {
    if (!id) {
      setExistingNegotiation(null);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch(`/api/listings/${id}/negotiations`);
        if (!res.ok) {
          if (!cancelled) setExistingNegotiation(null);
          return;
        }
        const data = (await res.json()) as NegotiationSummary[];
        if (!cancelled) {
          setExistingNegotiation(data[0] ?? null);
        }
      } catch {
        if (!cancelled) setExistingNegotiation(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const currentUserId = session?.user?.id;
  const isOwner =
    currentUserId && listing?.user.id
      ? currentUserId === listing.user.id
      : false;

  const images = useMemo(() => listing?.images ?? [], [listing?.images]);

  async function startNegotiation() {
    if (!id) return;
    if (!currentUserId) {
      router.push("/login");
      return;
    }
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch(`/api/listings/${id}/negotiations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(j?.error ?? "We couldn't start a negotiation for this listing.");
        return;
      }
      const neg = (await res.json()) as { id: string };
      setInfo("Negociación iniciada. Abriendo tu flujo de oferta...");
      router.push(`/negotiations/${neg.id}`);
    } finally {
      setBusy(false);
    }
  }

  if (!id) {
    return (
      <main className="mx-auto flex min-h-full max-w-3xl flex-1 flex-col gap-4 px-6 py-16">
        <p className="text-neutral-600">Invalid listing.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-full max-w-7xl flex-1 flex-col gap-6 px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-10">
      {/* Breadcrumb */}
      {listing ? (
        <nav className="flex items-center gap-1.5 text-sm text-zinc-500">
          <Link href="/listings" className="hover:text-zinc-900">
            Relojes
          </Link>
          <span>/</span>
          <span className="text-zinc-700">{listing.model.brand.name}</span>
          <span>/</span>
          <span className="text-zinc-950">{listing.title}</span>
        </nav>
      ) : (
        <Link
          href="/listings"
          className="w-fit text-sm text-zinc-500 hover:text-zinc-900"
        >
          ← Volver a listings
        </Link>
      )}

      {/* Alerts */}
      {error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {info ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {info}
        </p>
      ) : null}

      {/* Loading skeleton */}
      {loading && !error ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="space-y-3">
            <div className="aspect-[4/3] animate-pulse rounded-xl border border-zinc-200 bg-zinc-100" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square animate-pulse rounded-lg border border-zinc-200 bg-zinc-100"
                />
              ))}
            </div>
          </div>
          <div className="h-96 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100" />
        </div>
      ) : null}

      {!listing && !error && !loading ? (
        <p className="text-neutral-600">Listing no disponible.</p>
      ) : null}

      {/* Main content */}
      {listing ? (
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
          {/* LEFT — gallery + description */}
          <div className="space-y-8">
            <ListingGallery
              images={images}
              selectedIndex={selectedImageIndex}
              onSelect={setSelectedImageIndex}
              title={listing.title}
            />

            <div className="border-t border-zinc-200 pt-6">
              <h2 className="text-lg font-semibold text-zinc-950">Descripción</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                {listing.description ?? "El vendedor no agregó una descripción."}
              </p>
            </div>
          </div>

          {/* RIGHT — sticky action panel */}
          <aside className="space-y-5 lg:sticky lg:top-6">
            <ListingHeader listing={listing} />

            <div className="border-t border-zinc-100 pt-5">
              <ListingPricing price={listing.price} currency={listing.currency} />
            </div>

            <ListingActions
              listing={listing}
              isOwner={isOwner}
              existingNegotiation={existingNegotiation}
              sessionStatus={sessionStatus}
              busy={busy}
              onMakeOffer={() => void startNegotiation()}
            />

            {/* Details table */}
            <dl className="divide-y divide-zinc-100 border-t border-zinc-200 pt-1">
              <div className="grid grid-cols-2 py-3 text-sm">
                <dt className="text-zinc-500">Marca</dt>
                <dd className="font-medium text-zinc-950">{listing.model.brand.name}</dd>
              </div>
              <div className="grid grid-cols-2 py-3 text-sm">
                <dt className="text-zinc-500">Modelo</dt>
                <dd className="font-medium text-zinc-950">{listing.model.name}</dd>
              </div>
              <div className="grid grid-cols-2 py-3 text-sm">
                <dt className="text-zinc-500">Condición</dt>
                <dd className="font-medium text-zinc-950">
                  {getConditionLabel(listing.condition)}
                </dd>
              </div>
              <div className="grid grid-cols-2 py-3 text-sm">
                <dt className="text-zinc-500">Incluye</dt>
                <dd className="font-medium text-zinc-950">
                  {listing.hasBox && listing.hasPapers
                    ? "Caja + papeles"
                    : listing.hasBox
                      ? "Caja incluida"
                      : listing.hasPapers
                        ? "Papeles incluidos"
                        : "Solo el reloj"}
                </dd>
              </div>
            </dl>

            {/* Seller card */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                  {(listing.user.name ?? listing.user.email).slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-zinc-950">
                    {listing.user.name ?? listing.user.email}
                  </p>
                  <p className="text-xs text-zinc-500">Vendedor verificado</p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      ) : null}
    </main>
  );
}
