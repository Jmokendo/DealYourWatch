"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isBanned: boolean;
  createdAt: string;
  listingCount: number;
  negotiationCount: number;
}

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

interface UsersTabProps {
  onUnauthorized: () => void;
}

export function UsersTab({ onUnauthorized }: UsersTabProps) {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

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

  async function toggleBan(user: AdminUser) {
    setBusy(user.id);
    const next = !user.isBanned;
    setUsers((prev) =>
      prev ? prev.map((u) => (u.id === user.id ? { ...u, isBanned: next } : u)) : prev,
    );
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: next }),
      });
      if (!res.ok) {
        setUsers((prev) =>
          prev
            ? prev.map((u) => (u.id === user.id ? { ...u, isBanned: user.isBanned } : u))
            : prev,
        );
      }
    } catch {
      setUsers((prev) =>
        prev
          ? prev.map((u) => (u.id === user.id ? { ...u, isBanned: user.isBanned } : u))
          : prev,
      );
    } finally {
      setBusy(null);
    }
  }

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
      ) : !users || users.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-14 text-center">
          <Users className="h-8 w-8 text-zinc-300" />
          <p className="text-sm font-medium text-zinc-600">No users found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left">
                <th className="px-4 py-3 font-medium text-zinc-500">Email</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Name</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Joined</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Listings</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Status</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-50">
                  <td className="max-w-56 px-4 py-3">
                    <span className="block truncate text-zinc-900" title={u.email}>
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
                    {u.isBanned ? (
                      <Badge className="border-red-200 bg-red-50 text-xs text-red-700">
                        Banned
                      </Badge>
                    ) : (
                      <Badge className="border-green-200 bg-green-50 text-xs text-green-700">
                        Active
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.role !== "SUPER_ADMIN" && (
                      <Button
                        variant={u.isBanned ? "outline" : "destructive"}
                        size="sm"
                        disabled={busy === u.id}
                        onClick={() => void toggleBan(u)}
                        className="text-xs"
                      >
                        {busy === u.id
                          ? "..."
                          : u.isBanned
                            ? "Unban"
                            : "Ban"}
                      </Button>
                    )}
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
