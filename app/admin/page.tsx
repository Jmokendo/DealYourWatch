"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  CheckCircle2,
  DollarSign,
  LayoutDashboard,
  List,
  Loader2,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
  Trash2,
  Users,
  Wand2,
  XCircle,
} from "lucide-react";
import { OffersTab } from "./components/OffersTab";
import { NegotiationsTab } from "./components/NegotiationsTab";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/marketplace-ui";
import type { ListingStatus } from "@/lib/api/contracts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminMetrics {
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  rejectedListings: number;
  soldListings: number;
  totalUsers: number;
}

interface AdminListing {
  id: string;
  title: string;
  price: string;
  currency: string;
  status: ListingStatus;
  owner: { id: string; email: string; name: string | null };
  createdAt: string;
}

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  listingCount: number;
  negotiationCount: number;
}

interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error";
}

type Section = "dashboard" | "listings" | "users" | "moderation" | "offers" | "negotiations" | "demo";
type AddToast = (message: string, type: "success" | "error") => void;

// ─── Toast system ─────────────────────────────────────────────────────────────

function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast: AddToast = useCallback((message, type) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  return { toasts, addToast };
}

function Toaster({ toasts }: { toasts: ToastItem[] }) {
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            "flex min-w-64 max-w-80 items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg",
            t.type === "success"
              ? "border-green-200 bg-white text-green-800"
              : "border-red-200 bg-white text-red-700",
          )}
        >
          {t.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0 text-red-500" />
          )}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Confirm modal ────────────────────────────────────────────────────────────

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

// ─── Status badge ─────────────────────────────────────────────────────────────

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

// ─── Shared helpers ───────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

function formatRelativeTime(iso: string) {
  const deltaMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(deltaMs / 60000);
  const hours = Math.floor(deltaMs / 3600000);
  const days = Math.floor(deltaMs / 86400000);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${Math.max(minutes, 1)}m ago`;
}

function TableSkeletonRows({ cols = 6, rows = 5 }: { cols?: number; rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="h-10 border-b border-zinc-200 bg-zinc-50" />
      <div className="divide-y divide-zinc-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3">
            {Array.from({ length: cols }).map((_, j) => (
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

// ─── Dashboard view ───────────────────────────────────────────────────────────

function DashboardView({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/metrics");
      if (res.status === 401 || res.status === 403) {
        onUnauthorized();
        return;
      }
      if (!res.ok) {
        setError("Failed to load metrics.");
        return;
      }
      setMetrics((await res.json()) as AdminMetrics);
    } catch {
      setError("Failed to load metrics.");
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-zinc-100" />
        ))}
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="space-y-4">
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error ?? "Unknown error"}
        </p>
        <Button variant="outline" size="sm" onClick={() => void load()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  const stats = [
    { label: "Total listings", value: metrics.totalListings },
    { label: "Active (approved)", value: metrics.activeListings },
    { label: "Pending review", value: metrics.pendingListings },
    { label: "Rejected", value: metrics.rejectedListings },
    { label: "Sold", value: metrics.soldListings },
    { label: "Total users", value: metrics.totalUsers },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-1 pt-5">
              <p className="text-sm font-medium text-zinc-500">{s.label}</p>
            </CardHeader>
            <CardContent className="pb-5">
              <p className="text-3xl font-semibold tracking-tight text-zinc-900">
                {s.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => void load()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>
    </div>
  );
}

// ─── Listings view ────────────────────────────────────────────────────────────

function ListingsView({
  filterStatus,
  onUnauthorized,
  toast,
}: {
  filterStatus?: ListingStatus;
  onUnauthorized: () => void;
  toast: AddToast;
}) {
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
  // Snapshot held in a ref so it never triggers re-renders.
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

  // Optimistic approve / reject. Reverts on failure using the listing's
  // original status (passed in), avoiding a full-array snapshot.
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
        // Revert to original status.
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
      toast(
        nextStatus === "APPROVED" ? "Listing approved" : "Listing rejected",
        "success",
      );
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
    const selected = listings.filter((listing) => selectedIds.includes(listing.id));
    for (const listing of selected) {
      // eslint-disable-next-line no-await-in-loop
      await patchStatus(listing, "APPROVED");
    }
    setBulkBusy(false);
    setSelectedIds([]);
  };

  const openDeleteModal = (listing: AdminListing) => {
    snapshotRef.current = listings;
    setPendingDelete(listing);
  };

  // Optimistic delete. Restores from snapshot on failure.
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
            <p className="max-w-2xl text-sm text-zinc-500">
              Review listings faster with a visual queue, quick actions, and bulk approval.
            </p>
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
          <TableSkeletonRows cols={6} />
        ) : error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : !listings || listings.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-14 text-center">
            <List className="h-8 w-8 text-zinc-300" />
            <div>
              <p className="text-sm font-medium text-zinc-600">No listings found</p>
              <p className="mt-0.5 text-xs text-zinc-400">
                {activeStatus !== "ALL"
                  ? `No listings with status "${activeStatus.toLowerCase()}".`
                  : "No listings have been created yet."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-[14px] border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                    checked={allSelected}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setSelectedIds(listings.map((item) => item.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                  Select all
                </label>
                {selectedIds.length > 0 && (
                  <span>{selectedIds.length} selected</span>
                )}
              </div>
              <span className="text-xs text-zinc-500">Hover a row for fast actions</span>
            </div>

            <div className="space-y-3">
              {listings.map((l) => {
                const isBusy = busy === l.id;
                const selected = selectedIds.includes(l.id);
                const year = new Date(l.createdAt).getFullYear();

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
                        <label className="relative inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(event) => {
                              event.stopPropagation();
                              setSelectedIds((prev) =>
                                event.target.checked
                                  ? [...prev, l.id]
                                  : prev.filter((id) => id !== l.id),
                              );
                            }}
                            className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                            onClick={(event) => event.stopPropagation()}
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
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500">
                            <span>{year}</span>
                            <span>•</span>
                            <span>{formatRelativeTime(l.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:items-end">
                        <p className="text-lg font-semibold text-zinc-950">
                          {formatMoney(l.price, l.currency)}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={l.status} />
                          {l.status === "PENDING" && (
                            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                              Needs review
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3">
                      <div className="text-xs text-zinc-500">
                        Review in seconds: approve or inspect the public detail page.
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {l.status === "PENDING" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              void patchStatus(l, "APPROVED");
                            }}
                            disabled={isBusy}
                            className="bg-emerald-900 text-white hover:bg-emerald-800"
                          >
                            {isBusy ? "Approving..." : "Aprobar"}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            router.push(`/listings/${l.id}`);
                          }}
                          disabled={isBusy}
                        >
                          Revisar
                        </Button>
                        {l.status === "PENDING" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              void patchStatus(l, "REJECTED");
                            }}
                            disabled={isBusy}
                          >
                            Rechazar
                          </Button>
                        )}
                      </div>
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

// ─── Users view ───────────────────────────────────────────────────────────────

function UsersView({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      if (res.status === 401 || res.status === 403) {
        onUnauthorized();
        return;
      }
      if (!res.ok) {
        setError("Failed to load users.");
        return;
      }
      setUsers((await res.json()) as AdminUser[]);
    } catch {
      setError("Failed to load users.");
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
        <TableSkeletonRows cols={5} />
      ) : error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : !users || users.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-14 text-center">
          <Users className="h-8 w-8 text-zinc-300" />
          <div>
            <p className="text-sm font-medium text-zinc-600">No users found</p>
            <p className="mt-0.5 text-xs text-zinc-400">
              Registered users will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left">
                <th className="px-4 py-3 font-medium text-zinc-500">Email</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Name</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Joined</th>
                <th className="px-4 py-3 font-medium text-zinc-500">
                  Listings
                </th>
                <th className="px-4 py-3 font-medium text-zinc-500">Offers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-50">
                  <td className="max-w-56 px-4 py-3">
                    <span
                      className="block truncate text-zinc-900"
                      title={u.email}
                    >
                      {u.email}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {u.name ?? <span className="text-zinc-400">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-500">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-xs">
                      {u.listingCount}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-xs">
                      {u.negotiationCount}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-zinc-100 px-4 py-2.5 text-xs text-zinc-400">
            {users.length} user{users.length === 1 ? "" : "s"}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Demo tools view ─────────────────────────────────────────────────────────

type DemoAction = {
  id: string;
  label: string;
  description: string;
  endpoint: string;
};

const DEMO_ACTIONS: DemoAction[] = [
  {
    id: "all",
    label: "Generate Demo Marketplace",
    description: "Creates demo users, listings, and negotiations in one shot.",
    endpoint: "/api/admin/generate-demo-data",
  },
  {
    id: "users",
    label: "Generate Users",
    description: "Upserts 8 demo users (3 sellers + 5 buyers) with test credentials.",
    endpoint: "/api/admin/generate-users",
  },
  {
    id: "listings",
    label: "Generate Listings",
    description: "Creates up to 15 approved listings assigned to demo sellers.",
    endpoint: "/api/admin/generate-listings",
  },
  {
    id: "negotiations",
    label: "Generate Negotiations",
    description: "Creates up to 4 active negotiations with 2 offers each.",
    endpoint: "/api/admin/generate-negotiations",
  },
];

function DemoToolsView({ toast, onUnauthorized }: { toast: AddToast; onUnauthorized: () => void }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});

  const run = async (action: DemoAction) => {
    setLoadingId(action.id);
    try {
      const res = await fetch(action.endpoint, { method: "POST" });
      if (res.status === 401 || res.status === 403) {
        onUnauthorized();
        return;
      }
      const data = (await res.json()) as object;
      if (!res.ok) {
        const msg = typeof data === "object" && data !== null && "error" in data
          ? String((data as Record<string, unknown>).error)
          : "Request failed";
        toast(msg, "error");
        return;
      }
      setResults((prev) => ({ ...prev, [action.id]: data }));
      toast(`${action.label} — done!`, "success");
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Demo Data Tools</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Generate realistic marketplace data for testing. Operations are idempotent — safe to run multiple times.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {DEMO_ACTIONS.map((action) => {
          const isLoading = loadingId === action.id;
          const result = results[action.id];

          return (
            <Card key={action.id} className={cn(action.id === "all" && "sm:col-span-2")}>
              <CardHeader className="pb-2 pt-5">
                <p className="text-sm font-semibold text-zinc-900">{action.label}</p>
                <p className="text-xs text-zinc-500">{action.description}</p>
              </CardHeader>
              <CardContent className="space-y-3 pb-5">
                <Button
                  size="sm"
                  disabled={isLoading || loadingId !== null}
                  onClick={() => void run(action)}
                  className={cn(
                    action.id === "all"
                      ? "bg-zinc-900 text-white hover:bg-zinc-800"
                      : "bg-white text-zinc-900 hover:bg-zinc-50",
                    "border border-zinc-200",
                  )}
                  variant={action.id === "all" ? "default" : "outline"}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Running…
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-3.5 w-3.5" />
                      {action.label}
                    </>
                  )}
                </Button>

                {result != null && (
                  <pre className="overflow-x-auto rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <strong>Note:</strong> Demo users are created with the password{" "}
        <code className="rounded bg-amber-100 px-1 font-mono text-xs">demo-password123</code>.
        Run <em>Generate Demo Marketplace</em> first to ensure correct data dependencies.
      </div>
    </div>
  );
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_ITEMS: Array<{
  id: Section;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "listings", label: "Listings", Icon: List },
  { id: "users", label: "Users", Icon: Users },
  { id: "moderation", label: "Moderation", Icon: ShieldAlert },
  { id: "offers", label: "Offers", Icon: DollarSign },
  { id: "negotiations", label: "Negotiations", Icon: MessageSquare },
  { id: "demo", label: "Demo Tools", Icon: Wand2 },
];

const SECTION_TITLES: Record<Section, string> = {
  dashboard: "Dashboard",
  listings: "Listings",
  users: "Users",
  moderation: "Moderation",
  offers: "Offers",
  negotiations: "Negotiations",
  demo: "Demo Tools",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [section, setSection] = useState<Section>("dashboard");
  const [unauthorized, setUnauthorized] = useState(false);
  const { toasts, addToast } = useToasts();

  if (unauthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <Card className="w-full max-w-sm">
          <CardHeader className="pb-2 pt-6 text-center">
            <p className="text-lg font-semibold text-zinc-900">Unauthorized</p>
          </CardHeader>
          <CardContent className="pb-6 text-center">
            <p className="text-sm text-zinc-500">
              You don&apos;t have permission to access the admin panel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Toaster toasts={toasts} />

      <div className="flex min-h-screen bg-zinc-50">
        {/* Sidebar */}
        <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-200 bg-white">
          <div className="flex h-14 items-center gap-2.5 border-b border-zinc-200 px-4">
            <BarChart3 className="h-4 w-4 shrink-0 text-zinc-900" />
            <span className="text-sm font-semibold text-zinc-900">
              Admin Panel
            </span>
          </div>

          <nav className="flex-1 space-y-0.5 p-2">
            {NAV_ITEMS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  section === id
                    ? "bg-zinc-100 font-medium text-zinc-900"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 items-center border-b border-zinc-200 bg-white px-6">
            <h1 className="text-base font-semibold text-zinc-900">
              {SECTION_TITLES[section]}
            </h1>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {section === "dashboard" && (
              <DashboardView
                onUnauthorized={() => setUnauthorized(true)}
              />
            )}
            {section === "listings" && (
              <ListingsView
                onUnauthorized={() => setUnauthorized(true)}
                toast={addToast}
              />
            )}
            {section === "users" && (
              <UsersView onUnauthorized={() => setUnauthorized(true)} />
            )}
            {section === "moderation" && (
              <ListingsView
                filterStatus="PENDING"
                onUnauthorized={() => setUnauthorized(true)}
                toast={addToast}
              />
            )}
            {section === "offers" && (
              <OffersTab onUnauthorized={() => setUnauthorized(true)} />
            )}
            {section === "negotiations" && (
              <NegotiationsTab onUnauthorized={() => setUnauthorized(true)} />
            )}
            {section === "demo" && (
              <DemoToolsView
                toast={addToast}
                onUnauthorized={() => setUnauthorized(true)}
              />
            )}
          </main>
        </div>
      </div>
    </>
  );
}
