"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ListingDetail, NegotiationSummary } from "@/lib/api/contracts";
import { DEV_USER } from "@/lib/devUser";
import {
  formatMoney,
  getConditionLabel,
  getNegotiationStatusLabel,
} from "@/lib/marketplace-ui";

export default function ListingDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const router = useRouter();
  const { data: session, status } = useSession();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [existingNegotiation, setExistingNegotiation] =
    useState<NegotiationSummary | null>(null);
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

  const currentUserId = session?.user?.id ?? DEV_USER.id;
  const isOwner =
    currentUserId && listing?.user.id
      ? currentUserId === listing.user.id
      : false;

  async function startNegotiation() {
    if (!id) return;
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
      setInfo("Negotiation started. Opening your offer flow...");
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
    <main className="mx-auto flex min-h-full max-w-5xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="ghost" asChild>
          <Link href="/listings">← Back to listings</Link>
        </Button>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {info ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {info}
        </p>
      ) : null}

      {loading && !error ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="h-96 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100" />
          <div className="h-72 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100" />
        </div>
      ) : null}

      {!listing && !error && !loading && status !== "loading" ? (
        <p className="text-neutral-600 dark:text-neutral-400">Listing unavailable.</p>
      ) : null}

      {listing ? (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50">
              <div className="relative flex aspect-[4/3] items-center justify-center bg-zinc-100">
                {listing.images[0]?.url ? (
                  <Image
                    src={listing.images[0].url}
                    alt={listing.title}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 66vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-sm text-zinc-500">No listing photo</span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{listing.model.brand.name}</Badge>
                <Badge variant="outline">{getConditionLabel(listing.condition)}</Badge>
                <Badge variant="outline">{listing.status}</Badge>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight">{listing.title}</h1>
                <p className="text-3xl font-semibold text-zinc-900">
                  {formatMoney(listing.price, listing.currency)}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Condition</p>
                  <p className="mt-1 font-medium text-zinc-900">
                    {getConditionLabel(listing.condition)}
                  </p>
                </div>
                <div className="rounded-2xl border border-zinc-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Seller</p>
                  <p className="mt-1 font-medium text-zinc-900">
                    {listing.user.name ?? listing.user.email}
                  </p>
                </div>
              </div>

              {listing.description ? (
                <Card className="rounded-2xl border-zinc-200">
                  <CardContent className="space-y-2 p-5">
                    <h2 className="font-medium text-zinc-900">About this listing</h2>
                    <p className="text-sm leading-6 text-zinc-600">{listing.description}</p>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>

          <aside>
            <Card className="sticky top-24 rounded-2xl border-zinc-200">
              <CardContent className="space-y-4 p-5">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-zinc-900">Ready to move forward?</p>
                  <p className="text-sm text-zinc-600">
                    Start a negotiation to send your opening offer and track the response.
                  </p>
                </div>

                {existingNegotiation ? (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-sm font-medium text-zinc-900">Negotiation already started</p>
                    <p className="mt-1 text-sm text-zinc-600">
                      Status: {getNegotiationStatusLabel(existingNegotiation.status)}
                    </p>
                    <Button type="button" className="mt-3 w-full" asChild>
                      <Link href={`/negotiations/${existingNegotiation.id}`}>
                        View negotiation
                      </Link>
                    </Button>
                  </div>
                ) : status === "loading" ? (
                  <p className="text-sm text-neutral-500">Checking your account…</p>
                ) : isOwner ? (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                    You own this listing, so the buyer action is hidden here.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      type="button"
                      size="lg"
                      className="w-full"
                      disabled={busy}
                      onClick={() => void startNegotiation()}
                    >
                      {busy ? "Starting..." : "Make an Offer"}
                    </Button>
                    <p className="text-xs text-zinc-500">
                      You’ll be taken to the negotiation page to send your first offer.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>
        </section>
      ) : null}
    </main>
  );
}
