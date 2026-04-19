"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getNegotiationStatusLabel } from "@/lib/marketplace-ui";
import { cn } from "@/lib/utils";
import type { NegotiationStatus } from "@/lib/api/contracts";

interface AdminNegotiation {
  id: string;
  listingId: string;
  listingTitle: string;
  buyerId: string;
  buyerEmail: string;
  buyerName: string | null;
  status: NegotiationStatus;
  round: number;
  createdAt: string;
}

const STATUS_STYLES: Record<NegotiationStatus, string> = {
  ACTIVE: "border-blue-200 bg-blue-50 text-blue-800",
  ACCEPTED: "border-green-200 bg-green-50 text-green-800",
  CLOSED: "border-zinc-300 bg-zinc-100 text-zinc-600",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
  EXPIRED: "border-zinc-200 bg-zinc-50 text-zinc-400",
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

interface NegotiationsTabProps {
  onUnauthorized: () => void;
}

export function NegotiationsTab({ onUnauthorized }: NegotiationsTabProps) {
  const [negotiations, setNegotiations] = useState<AdminNegotiation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<NegotiationStatus | "ALL">("ALL");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/negotiations");
      if (res.status === 401 || res.status === 403) {
        onUnauthorized();
        return;
      }
      if (!res.ok) {
        setError("Failed to load negotiations.");
        return;
      }
      setNegotiations((await res.json()) as AdminNegotiation[]);
    } catch {
      setError("Failed to load negotiations.");
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    void load();
  }, [load]);

  const statuses: Array<NegotiationStatus | "ALL"> = [
    "ALL",
    "ACTIVE",
    "ACCEPTED",
    "CLOSED",
    "REJECTED",
  ];

  const visible =
    negotiations === null
      ? null
      : filter === "ALL"
        ? negotiations
        : negotiations.filter((n) => n.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => void load()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-full px-4 py-2 text-sm transition",
              filter === s
                ? "bg-zinc-950 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
            )}
          >
            {s === "ALL" ? "All" : getNegotiationStatusLabel(s)}
          </button>
        ))}
      </div>

      {loading ? (
        <TableSkeletonRows />
      ) : error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : !visible || visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-14 text-center">
          <MessageSquare className="h-8 w-8 text-zinc-300" />
          <p className="text-sm font-medium text-zinc-600">
            {filter === "ALL" ? "No negotiations yet" : `No ${filter.toLowerCase()} negotiations`}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left">
                <th className="px-4 py-3 font-medium text-zinc-500">Listing</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Buyer</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Status</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Round</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Date</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {visible.map((n) => (
                <tr key={n.id} className="hover:bg-zinc-50">
                  <td className="max-w-48 px-4 py-3">
                    <span className="block truncate text-zinc-900" title={n.listingTitle}>
                      {n.listingTitle}
                    </span>
                  </td>
                  <td className="max-w-40 px-4 py-3">
                    <span
                      className="block truncate text-zinc-700"
                      title={n.buyerEmail}
                    >
                      {n.buyerName ?? n.buyerEmail}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium",
                        STATUS_STYLES[n.status],
                      )}
                    >
                      {getNegotiationStatusLabel(n.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{n.round}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-500">
                    {formatDate(n.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Button asChild variant="outline" size="sm" className="text-xs">
                      <Link href={`/negotiations/${n.id}`}>Ver</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-zinc-100 px-4 py-2.5 text-xs text-zinc-400">
            {visible.length} negotiation{visible.length === 1 ? "" : "s"}
          </div>
        </div>
      )}
    </div>
  );
}
