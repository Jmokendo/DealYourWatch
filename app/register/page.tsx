"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRegister = useCallback(async () => {
    setBusy(true);
    setError(null);
    setSuccess(null);s
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(j?.error ?? "Registration failed");
        setBusy(false);
        return;
      }
      setSuccess("Cuenta creada. Ahora iniciá sesión.");
      setBusy(false);
      router.push("/login");
    } catch {
      setError("Registration failed");
      setBusy(false);
    }
  }, [email, password, router]);

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-1 flex-col gap-6 px-6 py-16">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Crear cuenta</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Registrate con email y contraseña.
        </p>
      </div>

      {error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          {success}
        </p>
      ) : null}

      <div className="grid gap-3">
        <label className="text-sm text-neutral-700 dark:text-neutral-300">
          Email
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="mt-1"
            autoComplete="email"
          />
        </label>
        <label className="text-sm text-neutral-700 dark:text-neutral-300">
          Contraseña
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="mt-1"
            autoComplete="new-password"
          />
        </label>
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={busy}
          onClick={() => void handleRegister()}
        >
          {busy ? "Creando…" : "Crear cuenta"}
        </Button>
      </div>
    </main>
  );
}

