"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney, getOfferStatusLabel } from "@/lib/marketplace-ui";
import type { OfferStatus } from "@/lib/api/contracts";

interface AdminOffer {
  id: string;
  negotiationId: string;
  listingId: string;
  listingTitle: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  amount: string;
  currency: string;
  reasonType: string;
  status: OfferStatus;
  createdAt: string;
}

const OFFER_STATUS_STYLES: Record<OfferStatus, string> = {
  PENDING: "border-yellow-200 bg-yellow-50 text-yellow-800",
  ACCEPTED: "border-green-200 bg-green-50 text-green-800",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
  COUNTERED: "border-blue-200 bg-blue-50 text-blue-800",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

function TableSkeletonRows() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="h-10 border-b border-zinc-200 bg-zinc-50" />
      <div className="divide-y divide-zinc-100">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3">
            {Array.from({ length: 5 }).map((_, j) => (
              <div
                key={j}
                className="h-4 animate-pulse rounded bg-zinc-100"
                style={{ flex: j === 0 ? 2 : 1 }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface OffersTabProps {
  onUnauthorized: () => void;
}

export function OffersTab({ onUnauthorized }: OffersTabProps) {
  const [offers, setOffers] = useState<AdminOffer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/offers");
      if (res.status === 401 || res.status === 403) {
        onUnauthorized();
        return;
      }
      if (!res.ok) {
        setError("Failed to load offers.");
        return;
      }
      setOffers((await res.json()) as AdminOffer[]);
    } catch {
      setError("Failed to load offers.");
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => void load()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      {loading ? (
        <TableSkeletonRows />
      ) : error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : !offers || offers.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-14 text-center">
          <DollarSign className="h-8 w-8 text-zinc-300" />
          <p className="text-sm font-medium text-zinc-600">No offers yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left">
                <th className="px-4 py-3 font-medium text-zinc-500">Listing</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Buyer</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Amount</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Status</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Date</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {offers.map((o) => (
                <tr key={o.id} className="hover:bg-zinc-50">
                  <td className="max-w-48 px-4 py-3">
                    <span className="block truncate text-zinc-900" title={o.listingTitle}>
                      {o.listingTitle}
                    </span>
                  </td>
                  <td className="max-w-40 px-4 py-3">
                    <span className="block truncate text-zinc-700" title={o.userEmail}>
                      {o.userName ?? o.userEmail}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-zinc-900">
                    {formatMoney(o.amount, o.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${OFFER_STATUS_STYLES[o.status]}`}
                    >
                      {getOfferStatusLabel(o.status)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-500">
                    {formatDate(o.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Button asChild variant="outline" size="sm" className="text-xs">
                      <Link href={`/negotiations/${o.negotiationId}`}>Ver</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-zinc-100 px-4 py-2.5 text-xs text-zinc-400">
            {offers.length} offer{offers.length === 1 ? "" : "s"}
          </div>
        </div>
      )}
    </div>
  );
}
