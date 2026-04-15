"use client";

import { useEffect, useState, useCallback } from "react";
import type { ListingSummary } from "@/lib/api/contracts";

// ─── Status badge ─────────────────────────────────────────────────────────────

type ActionState = "idle" | "loading" | "done";

interface RowAction {
  listingId: string;
  action: "approve" | "reject";
  state: ActionState;
}

// ─── Listing row ──────────────────────────────────────────────────────────────

function ListingRow({
  listing,
  onAction,
  actionState,
}: {
  listing: ListingSummary;
  onAction: (id: string, action: "approve" | "reject") => void;
  actionState: ActionState;
}) {
  const thumb = listing.images[0]?.url;
  const busy = actionState === "loading";

  return (
    <li className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      {/* Thumbnail */}
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
        {thumb ? (
          <img
            src={thumb}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
            Sin imagen
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-zinc-900">
          {listing.title}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">
          {listing.model.brand.name} · {listing.model.name}
        </p>
        <p className="mt-1 text-base font-bold text-zinc-900">
          {listing.currency} {Number(listing.price).toLocaleString("es-AR")}
        </p>
        <p className="mt-0.5 text-xs text-zinc-400">
          {new Date(listing.createdAt).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 flex-col gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => onAction(listing.id, "approve")}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "..." : "Aprobar"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onAction(listing.id, "reject")}
          className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "..." : "Rechazar"}
        </button>
      </div>
    </li>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function RowSkeleton() {
  return (
    <li className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="h-20 w-20 shrink-0 animate-pulse rounded-xl bg-zinc-100" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-100" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-zinc-100" />
      </div>
    </li>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminListingsPage() {
  const [listings, setListings] = useState<ListingSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rowActions, setRowActions] = useState<Record<string, RowAction>>({});
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/listings");
      if (res.status === 403) {
        setError("Acceso denegado. Solo admins pueden ver esta página.");
        setListings([]);
        return;
      }
      if (!res.ok) {
        setError("No se pudo cargar la lista.");
        return;
      }
      const data = (await res.json()) as ListingSummary[];
      setListings(data);
    } catch {
      setError("No se pudo cargar la lista.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAction(id: string, action: "approve" | "reject") {
    setRowActions((prev) => ({
      ...prev,
      [id]: { listingId: id, action, state: "loading" },
    }));

    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        setRowActions((prev) => ({
          ...prev,
          [id]: { listingId: id, action, state: "idle" },
        }));
        setToast("Error al procesar la acción.");
        setTimeout(() => setToast(null), 3000);
        return;
      }

      // Remove from list immediately
      setListings((prev) => prev?.filter((l) => l.id !== id) ?? []);
      setRowActions((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      const label = action === "approve" ? "aprobado" : "rechazado";
      setToast(`Listing ${label} correctamente.`);
      setTimeout(() => setToast(null), 3000);
    } catch {
      setRowActions((prev) => ({
        ...prev,
        [id]: { listingId: id, action, state: "idle" },
      }));
      setToast("Error al procesar la acción.");
      setTimeout(() => setToast(null), 3000);
    }
  }

  return (
    <main className="mx-auto flex min-h-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950">
          Panel Admin
        </h1>
        <p className="text-sm text-zinc-500">
          Listings pendientes de aprobación
        </p>
      </div>

      {/* Error */}
      {error ? (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {/* Loading */}
      {!listings && !error ? (
        <ul className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </ul>
      ) : null}

      {/* Empty state */}
      {listings && listings.length === 0 && !error ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-16 text-center">
          <p className="text-lg font-semibold text-zinc-900">
            Sin listings pendientes
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Todos los listings han sido revisados.
          </p>
        </div>
      ) : null}

      {/* List */}
      {listings && listings.length > 0 ? (
        <>
          <p className="text-sm text-zinc-500">
            {listings.length}{" "}
            {listings.length === 1
              ? "listing pendiente"
              : "listings pendientes"}
          </p>
          <ul className="flex flex-col gap-3">
            {listings.map((listing) => (
              <ListingRow
                key={listing.id}
                listing={listing}
                onAction={handleAction}
                actionState={rowActions[listing.id]?.state ?? "idle"}
              />
            ))}
          </ul>
        </>
      ) : null}

      {/* Toast */}
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </main>
  );
}
