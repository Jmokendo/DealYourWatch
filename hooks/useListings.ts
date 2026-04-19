"use client";

import { useCallback, useEffect, useState } from "react";
import type { ListingSummary, ListingStatus } from "@/lib/api/contracts";

interface UseListingsOptions {
  ownerId?: string;
  status?: ListingStatus;
  q?: string;
}

interface UseListingsResult {
  listings: ListingSummary[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useListings(options: UseListingsOptions = {}): UseListingsResult {
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (options.ownerId) params.set("ownerId", options.ownerId);
      if (options.status) params.set("status", options.status);
      if (options.q) params.set("q", options.q);

      const url = `/api/listings${params.size > 0 ? `?${params.toString()}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) {
        setError("Failed to load listings.");
        return;
      }
      setListings((await res.json()) as ListingSummary[]);
    } catch {
      setError("Failed to load listings.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.ownerId, options.status, options.q]);

  useEffect(() => {
    void load();
  }, [load]);

  return { listings, loading, error, reload: load };
}
