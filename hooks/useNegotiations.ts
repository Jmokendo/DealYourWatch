"use client";

import { useCallback, useEffect, useState } from "react";
import type { UserNegotiation } from "@/lib/api/contracts";

interface UseNegotiationsResult {
  negotiations: UserNegotiation[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useNegotiations(): UseNegotiationsResult {
  const [negotiations, setNegotiations] = useState<UserNegotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/me/negotiations");
      if (res.status === 401) {
        setNegotiations([]);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError("Failed to load negotiations.");
        return;
      }
      setNegotiations((await res.json()) as UserNegotiation[]);
    } catch {
      setError("Failed to load negotiations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { negotiations, loading, error, reload: load };
}
