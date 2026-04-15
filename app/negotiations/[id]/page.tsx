"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import type {
  ListingDetail,
  NegotiationSummary,
  OfferDto,
} from "@/lib/api/contracts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import {
  formatMoney,
  getNegotiationStatusLabel,
  getOfferStatusLabel,
} from "@/lib/marketplace-ui";

function statusBadgeVariant(status: OfferDto["status"] | NegotiationSummary["status"]) {
  if (status === "ACCEPTED") return "default";
  if (status === "REJECTED" || status === "EXPIRED") return "destructive";
  return "secondary";
}

export default function NegotiationPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { data: session, status: sessionStatus } = useSession();

  const [negotiation, setNegotiation] = useState<NegotiationSummary | null>(null);
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [offers, setOffers] = useState<OfferDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState("");
  const [openingNote, setOpeningNote] = useState("");
  const [counterAmount, setCounterAmount] = useState("");
  const [counterNote, setCounterNote] = useState("");

  const loadAll = useCallback(async () => {
    if (!id) return;
    setError(null);
    setLoading(true);
    try {
      const [nRes, oRes] = await Promise.all([
        fetch(`/api/negotiations/${id}`),
        fetch(`/api/negotiations/${id}/offers`),
      ]);
      if (nRes.status === 403 || oRes.status === 403) {
        setError("You do not have access to this negotiation.");
        setNegotiation(null);
        setOffers([]);
        setListing(null);
        return;
      }
      if (!nRes.ok) {
        setError("Negotiation not found.");
        setNegotiation(null);
        setOffers([]);
        setListing(null);
        return;
      }
      if (!oRes.ok) {
        setError("We couldn't load the negotiation offers.");
        return;
      }
      const n = (await nRes.json()) as NegotiationSummary;
      const o = (await oRes.json()) as OfferDto[];
      setNegotiation(n);
      setOffers(o);

      const lRes = await fetch(`/api/listings/${n.listingId}`);
      if (!lRes.ok) {
        setError("We couldn't load the related listing.");
        setListing(null);
        return;
      }
      setListing((await lRes.json()) as ListingDetail);
    } catch {
      setError("We couldn't load this negotiation right now.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const userId = session?.user?.id;
  const sellerId = listing?.user.id;

  const role = useMemo(() => {
    if (!userId || !negotiation || !sellerId) return null;
    if (userId === negotiation.buyerId) return "buyer" as const;
    if (userId === sellerId) return "seller" as const;
    return null;
  }, [userId, negotiation, sellerId]);

  const pendingOffer = useMemo(
    () => offers.find((x) => x.status === "PENDING"),
    [offers],
  );

  const canActOnPending =
    negotiation?.status === "ACTIVE" &&
    pendingOffer &&
    userId &&
    pendingOffer.userId !== userId;

  const showOpeningForm =
    negotiation?.status === "ACTIVE" &&
    role === "buyer" &&
    offers.length === 0;

  const lastOffer = offers.at(-1) ?? null;
  const waitingOnYou =
    Boolean(canActOnPending) && pendingOffer ? pendingOffer.userId !== userId : false;
  const waitingOnOtherParty =
    negotiation?.status === "ACTIVE" &&
    pendingOffer &&
    pendingOffer.userId === userId;

  async function submitOpeningOffer() {
    if (!id) return;
    const n = Number.parseFloat(amount);
    if (!Number.isFinite(n) || n <= 0) {
      setError("Enter a valid opening offer amount.");
      return;
    }
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/negotiations/${id}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: n,
          reasonNote: openingNote.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(j?.error ?? "We couldn't send your offer.");
        return;
      }
      setAmount("");
      setOpeningNote("");
      setSuccess("Offer sent.");
      await loadAll();
    } finally {
      setBusy(false);
    }
  }

  async function patchOffer(
    offerId: string,
    action: "accept" | "reject" | "counter",
  ) {
    if (!id) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const body: Record<string, unknown> = { action };
      if (action === "counter") {
        const n = Number.parseFloat(counterAmount);
        if (!Number.isFinite(n) || n <= 0) {
          setError("Enter a valid counter amount.");
          setBusy(false);
          return;
        }
        body.amount = n;
        if (counterNote.trim()) body.note = counterNote.trim();
      }
      const res = await fetch(`/api/negotiations/${id}/offers/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(j?.error ?? "That action could not be completed.");
        return;
      }
      setCounterAmount("");
      setCounterNote("");
      setSuccess(
        action === "accept"
          ? "Offer accepted."
          : action === "reject"
            ? "Offer rejected."
            : "Counter-offer sent.",
      );
      await loadAll();
    } finally {
      setBusy(false);
    }
  }

  if (!id) {
    return (
      <main className="mx-auto flex min-h-full max-w-3xl flex-1 flex-col gap-4 px-6 py-16">
        <p className="text-neutral-600">Invalid negotiation.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-full max-w-5xl flex-1 flex-col gap-6 px-6 py-16">
      <Button type="button" variant="ghost" asChild>
        <Link href="/listings">← Back to listings</Link>
      </Button>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </p>
      ) : null}

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="h-96 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100" />
          <div className="h-64 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100" />
        </div>
      ) : null}

      {sessionStatus === "unauthenticated" && !loading ? (
        <Card className="rounded-2xl border-zinc-200">
          <CardContent className="space-y-3 p-5">
            <p className="text-sm text-zinc-600">
              Sign in to view this negotiation.
            </p>
            <Button type="button" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {negotiation && listing ? (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusBadgeVariant(negotiation.status)}>
                  {getNegotiationStatusLabel(negotiation.status)}
                </Badge>
                {role ? <Badge variant="outline">You are the {role}</Badge> : null}
                <Badge variant="outline">Round {negotiation.round}</Badge>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight">Negotiation</h1>
                <p className="text-sm text-zinc-600">
                  For{" "}
                  <Link className="font-medium underline" href={`/listings/${listing.id}`}>
                    {listing.title}
                  </Link>
                </p>
              </div>
            </div>

            <Card className="rounded-2xl border-zinc-200">
              <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Listing price</p>
                  <p className="mt-1 font-medium text-zinc-900">
                    {formatMoney(listing.price, listing.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Current state</p>
                  <p className="mt-1 font-medium text-zinc-900">
                    {waitingOnYou
                      ? "Waiting for your response"
                      : waitingOnOtherParty
                        ? "Waiting for the other party"
                        : getNegotiationStatusLabel(negotiation.status)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Last action</p>
                  <p className="mt-1 font-medium text-zinc-900">
                    {lastOffer
                      ? `${lastOffer.userId === userId ? "You" : "Other party"} ${lastOffer.status === "PENDING" ? "sent" : lastOffer.status.toLowerCase()} an offer`
                      : "No offers yet"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <section className="space-y-3">
              <h2 className="text-lg font-medium">Offer history</h2>
              {offers.length === 0 ? (
                <Card className="rounded-2xl border-zinc-200">
                  <CardContent className="p-5 text-sm text-zinc-600">
                    No offers yet. The buyer can send the opening offer below.
                  </CardContent>
                </Card>
              ) : (
                <ul className="space-y-3">
                  {offers.map((offer, index) => {
                    const isLatest = index === offers.length - 1;
                    const isMine = offer.userId === userId;

                    return (
                      <li key={offer.id}>
                        <Card
                          className={`rounded-2xl border-zinc-200 ${isLatest ? "border-zinc-900 shadow-sm" : ""}`}
                        >
                          <CardContent className="space-y-3 p-5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="font-medium text-zinc-900">
                                  {isMine ? "Your offer" : "Their offer"}
                                </p>
                                <p className="text-sm text-zinc-600">
                                  {formatMoney(offer.amount, offer.currency)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {isLatest ? <Badge variant="outline">Latest action</Badge> : null}
                                <Badge variant={statusBadgeVariant(offer.status)}>
                                  {getOfferStatusLabel(offer.status)}
                                </Badge>
                              </div>
                            </div>

                            <p className="text-sm text-zinc-600">
                              Type: {offer.reasonType}
                            </p>

                            {offer.reasonNote ? (
                              <p className="rounded-xl bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                                {offer.reasonNote}
                              </p>
                            ) : null}
                          </CardContent>
                        </Card>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {showOpeningForm ? (
              <section className="space-y-3">
                <Card className="rounded-2xl border-zinc-200">
                  <CardContent className="space-y-4 p-5">
                    <div className="space-y-1">
                      <h2 className="text-lg font-medium">Send your opening offer</h2>
                      <p className="text-sm text-zinc-600">
                        Enter the amount you want to offer for this watch.
                      </p>
                    </div>
                    <div className="grid max-w-xl gap-3">
                      <label className="text-sm text-neutral-600">
                        Amount ({listing.currency})
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="mt-1"
                        />
                      </label>
                      <label className="text-sm text-neutral-600">
                        Note (optional)
                        <Input
                          value={openingNote}
                          onChange={(e) => setOpeningNote(e.target.value)}
                          className="mt-1"
                          placeholder="Add context for your offer"
                        />
                      </label>
                      <Button
                        type="button"
                        className="w-full sm:w-fit"
                        disabled={busy}
                        onClick={() => void submitOpeningOffer()}
                      >
                        {busy ? "Sending..." : "Send offer"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </section>
            ) : null}

            <section className="space-y-3">
              <Card className="rounded-2xl border-zinc-200">
                <CardContent className="space-y-4 p-5">
                  <div className="space-y-1">
                    <h2 className="text-lg font-medium">Respond to the current offer</h2>
                    <p className="text-sm text-zinc-600">
                      Actions are only enabled when there is a pending offer from the other party.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      disabled={!canActOnPending || busy}
                      onClick={() => pendingOffer && void patchOffer(pendingOffer.id, "accept")}
                    >
                      Accept
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={!canActOnPending || busy}
                      onClick={() => pendingOffer && void patchOffer(pendingOffer.id, "reject")}
                    >
                      Reject
                    </Button>
                  </div>

                  <div className="grid max-w-xl gap-3">
                    <label className="text-sm text-neutral-600">
                      Counter amount ({listing.currency})
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={counterAmount}
                        onChange={(e) => setCounterAmount(e.target.value)}
                        className="mt-1"
                        disabled={!canActOnPending || busy}
                      />
                    </label>
                    <label className="text-sm text-neutral-600">
                      Counter note (optional)
                      <Input
                        value={counterNote}
                        onChange={(e) => setCounterNote(e.target.value)}
                        className="mt-1"
                        placeholder="Explain your counter-offer"
                        disabled={!canActOnPending || busy}
                      />
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-fit"
                      disabled={!canActOnPending || busy}
                      onClick={() => pendingOffer && void patchOffer(pendingOffer.id, "counter")}
                    >
                      Counter
                    </Button>
                  </div>

                  {!canActOnPending ? (
                    <p className="text-sm text-zinc-500">
                      {negotiation.status !== "ACTIVE"
                        ? "This negotiation is closed, so no further actions are available."
                        : waitingOnOtherParty
                          ? "You have already acted. Wait for the other party to respond."
                          : "There is no pending offer to respond to yet."}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            </section>
          </div>

          <aside>
            <Card className="rounded-2xl border-zinc-200">
              <CardContent className="space-y-4 p-5">
                <h2 className="font-medium text-zinc-900">Listing summary</h2>
                <div className="space-y-2 text-sm text-zinc-600">
                  <p className="font-medium text-zinc-900">{listing.title}</p>
                  <p>{formatMoney(listing.price, listing.currency)}</p>
                  <p>Condition: {listing.condition}</p>
                  <p>Seller: {listing.user.name ?? listing.user.email}</p>
                </div>
                <Button type="button" variant="outline" className="w-full" asChild>
                  <Link href={`/listings/${listing.id}`}>View listing</Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </section>
      ) : null}
    </main>
  );
}
