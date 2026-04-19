"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LoginCTA } from "@/components/LoginCTA";
import { MyListings } from "./components/MyListings";
import { MyNegotiations } from "./components/MyNegotiations";

type Tab = "listings" | "negotiations";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "listings", label: "Mis publicaciones" },
  { id: "negotiations", label: "Mis negociaciones" },
];

export default function MePage() {
  const [tab, setTab] = useState<Tab>("listings");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/me");
        setIsAuthenticated(res.ok);
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="h-12 w-48 animate-pulse rounded-lg bg-zinc-200" />
          </div>
        </header>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Panel
              </p>
              <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-zinc-900">
                Mi cuenta
              </h1>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <p className="text-sm text-zinc-600">
              Debes iniciar sesión para ver tu cuenta.
            </p>
            <LoginCTA
              redirectTo="/me"
              message="Inicia sesión para gestionar tus publicaciones y negociaciones."
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Panel
              </p>
              <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-zinc-900">
                Mi cuenta
              </h1>
            </div>
            <Link
              href="/sell"
              className="inline-flex items-center justify-center rounded-[12px] bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              + Publicar reloj
            </Link>
          </div>

          <nav className="mt-5 flex gap-1">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  tab === id
                    ? "bg-zinc-950 text-white"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
                )}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {tab === "listings" && <MyListings />}
        {tab === "negotiations" && <MyNegotiations />}
      </main>
    </div>
  );
}
