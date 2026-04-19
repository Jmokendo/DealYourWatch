"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRedirectIntent } from "@/lib/auth-utils";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      setError(data.error || "Error al iniciar sesión");
      return;
    }

    const redirectTo = getRedirectIntent(Object.fromEntries(searchParams));
    router.push(redirectTo);
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <section className="order-first lg:order-last">
          <div className="rounded-[12px] bg-white p-8 shadow-lg ring-1 ring-zinc-200 sm:p-10">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-zinc-500">
                Bienvenido de nuevo
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
                Ingresa a tu cuenta
              </h1>
              <p className="max-w-xl text-sm leading-7 text-zinc-600">
                Accede a la plataforma de relojes de lujo en LATAM con un inicio de sesión seguro y rápido.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-zinc-700" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-zinc-600">
                  <label className="font-medium" htmlFor="password">
                    Contraseña
                  </label>
                  <Link href="/login" className="font-medium text-zinc-900 hover:text-zinc-700">
                    Olvidé mi contraseña
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                  autoComplete="current-password"
                />
              </div>

              {error ? (
                <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <Button
                type="submit"
                className="flex w-full items-center justify-center rounded-[12px] bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={busy}
              >
                {busy ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Entrando a mi cuenta
                  </span>
                ) : (
                  "Entrar a mi cuenta"
                )}
              </Button>

              <div className="relative py-4">
                <div className="absolute inset-x-0 top-1/2 h-px bg-zinc-200" />
                <p className="relative mx-auto w-fit bg-white px-3 text-sm text-zinc-500">
                  o continúa con
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                className="flex w-full items-center justify-center gap-3 rounded-[12px] border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-50"
              >
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19.6 10.23c0-.64-.06-1.25-.16-1.84H10v3.48h5.42c-.23 1.2-.93 2.22-1.98 2.9v2.4h3.2c1.87-1.72 2.96-4.28 2.96-7." fill="#4285F4" />
                  <path d="M10 20c2.7 0 4.96-.9 6.63-2.45l-3.2-2.4c-.88.6-2.01.95-3.43.95-2.64 0-4.88-1.78-5.68-4.2H1.07v2.64C2.73 17.9 6.13 20 10 20z" fill="#34A853" />
                  <path d="M4.32 11.9a5.99 5.99 0 0 1 0-3.8V5.46H1.07a9.99 9.99 0 0 0 0 8.08l3.25-1.64z" fill="#FBBC05" />
                  <path d="M10 4.02c1.47 0 2.8.5 3.84 1.48l2.88-2.88C14.94 1.05 12.7 0 10 0 6.13 0 2.73 2.1 1.07 5.46l3.25 2.64C5.12 5.8 7.36 4.02 10 4.02z" fill="#EA4335" />
                </svg>
                Continuar con Google
              </Button>

              <p className="mt-4 text-center text-sm text-zinc-600">
                ¿No tienes cuenta?{' '}
                <Link href="/register" className="font-semibold text-zinc-950 hover:text-zinc-700">
                  Regístrate
                </Link>
              </p>
            </form>

            <p className="mt-6 text-center text-xs text-zinc-500">
              🔒 Conexión segura
            </p>
          </div>
        </section>

        <aside className="relative overflow-hidden rounded-[12px] bg-zinc-950 px-8 py-10 text-white shadow-lg lg:min-h-[560px] lg:px-12 lg:py-14">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute left-[-10%] top-8 text-[5rem] font-black uppercase tracking-[0.4em] text-white/10">
              Rolex
            </div>
            <div className="absolute left-10 top-40 text-[4.5rem] font-black uppercase tracking-[0.35em] text-white/10">
              Patek
            </div>
            <div className="absolute right-4 top-[calc(100%-10rem)] text-[5rem] font-black uppercase tracking-[0.4em] text-white/10">
              AP
            </div>
          </div>

          <div className="relative space-y-8">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.28em] text-zinc-400">WATCHS</p>
              <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                El marketplace de relojes de lujo en LATAM
              </h2>
            </div>

            <div className="space-y-4 rounded-[12px] bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-sm">
              <p className="text-base font-medium text-white">Confianza que se siente en cada paso</p>
              <ul className="space-y-3 text-sm leading-7 text-zinc-200">
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                    ✓
                  </span>
                  +1,200 relojes verificados
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                    ✓
                  </span>
                  Compradores protegidos
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                    ✓
                  </span>
                  Vendedores verificados
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
