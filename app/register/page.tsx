"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRedirectIntent } from "@/lib/auth-utils";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [accountType, setAccountType] = useState<"comprador" | "vendedor" | "ambos">("comprador");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const passwordStrength = useMemo(() => {
    if (!password) return "";
    if (password.length >= 12) return "Fuerte";
    if (password.length >= 10) return "Media";
    if (password.length >= 8) return "Aceptable";
    return "Muy débil";
  }, [password]);

  const canSubmit = Boolean(name.trim() && email.trim() && password.length >= 8) && !busy;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      setError(data.error || "Error al registrarse");
      return;
    }

    setSuccess("Cuenta creada. Redirigiendo a login...");
    const redirectTo = getRedirectIntent(Object.fromEntries(searchParams));
    const loginUrl = `/login?${new URLSearchParams({ redirectTo }).toString()}`;
    router.push(loginUrl);
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <section className="order-first lg:order-last">
          <div className="rounded-[12px] bg-white p-8 shadow-lg ring-1 ring-zinc-200 sm:p-10">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-zinc-500">
                Crear cuenta
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
                Empieza en menos de 1 minuto
              </h1>
              <p className="max-w-xl text-sm leading-7 text-zinc-600">
                Únete a WATCHS y comienza a comprar o vender relojes de lujo con seguridad.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-zinc-700" htmlFor="name">
                  Nombre
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre completo"
                  required
                />
              </div>

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

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-zinc-600">
                  <label className="font-medium" htmlFor="password">
                    Contraseña
                  </label>
                  <span className="text-zinc-500">Mínimo 8 caracteres</span>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Crea una contraseña segura"
                  required
                  autoComplete="new-password"
                />
                {password && (
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>{passwordStrength}</span>
                    <span>{password.length} caracteres</span>
                  </div>
                )}
              </div>

              <div className="rounded-[12px] border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-sm font-semibold text-zinc-900">Opcional</p>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700" htmlFor="whatsapp">
                      WhatsApp
                    </label>
                    <Input
                      id="whatsapp"
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="(+56) 9 1234 5678"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-zinc-700">Tipo de cuenta</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      {[
                        { value: "comprador", label: "Comprador" },
                        { value: "vendedor", label: "Vendedor" },
                        { value: "ambos", label: "Ambos" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setAccountType(option.value as "comprador" | "vendedor" | "ambos")}
                          className={`rounded-[12px] border px-4 py-3 text-sm font-medium transition ${
                            accountType === option.value
                              ? "border-zinc-950 bg-zinc-950 text-white"
                              : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {error ? (
                <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
              {success ? (
                <div className="rounded-[12px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </div>
              ) : null}

              <Button
                type="submit"
                className="flex w-full items-center justify-center rounded-[12px] bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!canSubmit}
              >
                {busy ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creando cuenta gratis
                  </span>
                ) : (
                  "Crear cuenta gratis"
                )}
              </Button>

              <div className="rounded-[12px] border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                <p className="flex items-center gap-2">
                  <span className="text-emerald-500">✔</span> Sin comisiones ocultas
                </p>
                <p className="mt-2 flex items-center gap-2">
                  <span className="text-emerald-500">✔</span> Registro rápido y seguro
                </p>
              </div>

              <p className="text-center text-sm text-zinc-600">
                Ya tienes cuenta?{' '}
                <Link href="/login" className="font-semibold text-zinc-950 hover:text-zinc-700">
                  Ingresar
                </Link>
              </p>
            </form>
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
                Compra y vende relojes de lujo verificados
              </h2>
            </div>

            <div className="space-y-4 rounded-[12px] bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-sm">
              <p className="text-base font-medium text-white">Acceso rápido, seguro y transparente</p>
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
                  Sin comisiones ocultas
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                    ✓
                  </span>
                  Vendedores verificados
                </li>
              </ul>
            </div>

            <div className="rounded-[12px] bg-white/5 p-6 text-sm leading-7 text-zinc-300 ring-1 ring-white/10">
              <p className="font-medium text-white">Empieza con confianza</p>
              <p className="mt-3 text-zinc-300">
                Regístrate en segundos y únete a la comunidad que ya confía en WATCHS.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

