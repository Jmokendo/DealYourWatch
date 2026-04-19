"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, List, RefreshCw, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/marketplace-ui";
import type { ListingStatus } from "@/lib/api/contracts";

interface AdminListing {
  id: string;
  title: string;
  price: string;
  currency: string;
  status: ListingStatus;
  owner: { id: string; email: string; name: string | null };
  createdAt: string;
}

const STATUS_STYLES: Record<ListingStatus, string> = {
  PENDING: "border-yellow-200 bg-yellow-50 text-yellow-800",
  APPROVED: "border-green-200 bg-green-50 text-green-800",
  SOLD: "border-zinc-300 bg-zinc-100 text-zinc-600",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
  EXPIRED: "border-zinc-200 bg-zinc-50 text-zinc-400",
};

function StatusBadge({ status }: { status: ListingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
      )}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function formatRelativeTime(iso: string) {
  const deltaMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(deltaMs / 86400000);
  const hours = Math.floor(deltaMs / 3600000);
  const minutes = Math.floor(deltaMs / 60000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${Math.max(minutes, 1)}m ago`;
}

function TableSkeletonRows() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="h-10 border-b border-zinc-200 bg-zinc-50" />
      <div className="divide-y divide-zinc-100">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3">
            {Array.from({ length: 6 }).map((_, j) => (
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

interface ConfirmModalProps {
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({
  title,
  body,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <Card
        className="w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="pb-2 pt-6">
          <p className="text-base font-semibold text-zinc-900">{title}</p>
        </CardHeader>
        <CardContent className="space-y-5 pb-6">
          <p className="text-sm leading-relaxed text-zinc-500">{body}</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type AddToast = (message: string, type: "success" | "error") => void;

interface ListingsTabProps {
  filterStatus?: ListingStatus;
  onUnauthorized: () => void;
  toast: AddToast;
}

export function ListingsTab({
  filterStatus,
  onUnauthorized,
  toast,
}: ListingsTabProps) {
  const router = useRouter();
  const [listings, setListings] = useState<AdminListing[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AdminListing | null>(null);
  const [activeStatus, setActiveStatus] = useState<ListingStatus | "ALL">(
    filterStatus ?? "ALL",
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const snapshotRef = useRef<AdminListing[] | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url =
        activeStatus && activeStatus !== "ALL"
          ? `/api/admin/listings?status=${activeStatus}`
          : "/api/admin/listings";
      const res = await fetch(url);
      if (res.status === 401 || res.status === 403) {
        onUnauthorized();
        return;
      }
      if (!res.ok) {
        setError("Failed to load listings.");
        return;
      }
      setListings((await res.json()) as AdminListing[]);
      setSelectedIds([]);
    } catch {
      setError("Failed to load listings.");
    } finally {
      setLoading(false);
    }
  }, [activeStatus, onUnauthorized]);

  useEffect(() => {
    setActiveStatus(filterStatus ?? "ALL");
  }, [filterStatus]);

  useEffect(() => {
    void load();
  }, [load]);

  const patchStatus = async (listing: AdminListing, nextStatus: ListingStatus) => {
    setBusy(listing.id);
    setListings((prev) =>
      prev
        ? prev.map((l) => (l.id === listing.id ? { ...l, status: nextStatus } : l))
        : prev,
    );
    try {
      const res = await fetch(`/api/admin/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        setListings((prev) =>
          prev
            ? prev.map((l) =>
                l.id === listing.id ? { ...l, status: listing.status } : l,
              )
            : prev,
        );
        toast("Failed to update listing", "error");
        return;
      }
      toast(nextStatus === "APPROVED" ? "Listing approved" : "Listing rejected", "success");
    } catch {
      setListings((prev) =>
        prev
          ? prev.map((l) =>
              l.id === listing.id ? { ...l, status: listing.status } : l,
            )
          : prev,
      );
      toast("Something went wrong", "error");
    } finally {
      setBusy(null);
    }
  };

  const bulkApprove = async () => {
    if (!listings || selectedIds.length === 0) return;
    setBulkBusy(true);
    const selected = listings.filter((l) => selectedIds.includes(l.id));
    for (const listing of selected) {
      // eslint-disable-next-line no-await-in-loop
      await patchStatus(listing, "APPROVED");
    }
    setBulkBusy(false);
    setSelectedIds([]);
  };

  const executeDelete = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    const snapshot = snapshotRef.current;
    setPendingDelete(null);
    setBusy(target.id);
    setListings((prev) => prev?.filter((l) => l.id !== target.id) ?? null);
    try {
      const res = await fetch(`/api/admin/listings/${target.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        if (snapshot !== null) setListings(snapshot);
        toast("Delete failed", "error");
        return;
      }
      toast("Listing deleted", "success");
    } catch {
      if (snapshot !== null) setListings(snapshot);
      toast("Something went wrong", "error");
    } finally {
      setBusy(null);
      snapshotRef.current = null;
    }
  };

  const allSelected = !!listings && selectedIds.length === listings.length;
  const count = listings?.length ?? 0;
  const title = filterStatus === "PENDING" ? "Listings pendientes de revisión" : "Listings";
  const statuses: Array<ListingStatus | "ALL"> = ["ALL", "PENDING", "APPROVED", "REJECTED"];

  return (
    <>
      {pendingDelete && (
        <ConfirmModal
          title="Delete listing?"
          body="This action is irreversible. This will permanently delete the listing and all related data."
          confirmLabel="Delete"
          onConfirm={() => void executeDelete()}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
                {title}
              </h2>
              <Badge className="rounded-full px-2.5 py-1 text-xs text-zinc-700">
                {count}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void load()}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            {activeStatus === "PENDING" && (
              <Button
                variant="default"
                size="sm"
                disabled={selectedIds.length === 0 || bulkBusy}
                onClick={() => void bulkApprove()}
                className="bg-emerald-900 text-white hover:bg-emerald-800"
              >
                {bulkBusy ? "Processing..." : `Approve selected (${selectedIds.length})`}
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setActiveStatus(status)}
              className={cn(
                "rounded-full px-4 py-2 text-sm transition",
                activeStatus === status
                  ? "bg-zinc-950 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
              )}
            >
              {status === "ALL" ? "All" : status.toLowerCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <TableSkeletonRows />
        ) : error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : !listings || listings.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-14 text-center">
            <List className="h-8 w-8 text-zinc-300" />
            <p className="text-sm font-medium text-zinc-600">No listings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-[14px] border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-zinc-300"
                  checked={allSelected}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(listings.map((l) => l.id));
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                />
                Select all
                {selectedIds.length > 0 && (
                  <span className="ml-1 text-zinc-500">({selectedIds.length})</span>
                )}
              </label>
              <span className="text-xs text-zinc-400">Hover a row for actions</span>
            </div>

            <div className="space-y-3">
              {listings.map((l) => {
                const isBusy = busy === l.id;
                const selected = selectedIds.includes(l.id);

                return (
                  <div
                    key={l.id}
                    className={cn(
                      "group rounded-[18px] border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md",
                      selected && "ring-2 ring-zinc-900/10",
                      isBusy && "opacity-70",
                    )}
                    onClick={() => router.push(`/listings/${l.id}`)}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4 sm:min-w-0 sm:flex-1">
                        <label
                          className="relative inline-flex items-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(e) => {
                              setSelectedIds((prev) =>
                                e.target.checked
                                  ? [...prev, l.id]
                                  : prev.filter((id) => id !== l.id),
                              );
                            }}
                            className="h-4 w-4 rounded border-zinc-300"
                          />
                        </label>
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-sm font-semibold text-zinc-500">
                          {l.owner.name?.slice(0, 2).toUpperCase() || "LN"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                            {l.owner.name ?? l.owner.email}
                          </p>
                          <p className="mt-1 truncate text-base font-semibold text-zinc-900">
                            {l.title}
                          </p>
                          <p className="mt-1 text-xs text-zinc-400">
                            {formatRelativeTime(l.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:items-end">
                        <p className="text-lg font-semibold text-zinc-950">
                          {formatMoney(l.price, l.currency)}
                        </p>
                        <StatusBadge status={l.status} />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-zinc-100 pt-3">
                      {l.status === "PENDING" && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              void patchStatus(l, "APPROVED");
                            }}
                            disabled={isBusy}
                            className="bg-emerald-900 text-white hover:bg-emerald-800"
                          >
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                            {isBusy ? "..." : "Aprobar"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              void patchStatus(l, "REJECTED");
                            }}
                            disabled={isBusy}
                          >
                            <XCircle className="mr-1.5 h-3.5 w-3.5" />
                            Rechazar
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/listings/${l.id}`);
                        }}
                        disabled={isBusy}
                      >
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          snapshotRef.current = listings;
                          setPendingDelete(l);
                        }}
                        disabled={isBusy}
                        className="text-red-600 hover:border-red-200 hover:bg-red-50"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
