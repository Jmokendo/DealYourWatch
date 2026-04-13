"use client";

import { signIn, useSession } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const { status } = useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
      return;
    }
    if (status !== "unauthenticated") return;
    void signIn("google", { callbackUrl }).catch(() => {
      setError(
        "No se pudo iniciar el inicio de sesión. Comprobá las variables de entorno de Google OAuth y AUTH_SECRET.",
      );
    });
  }, [callbackUrl, router, status]);

  return (
    <main className="mx-auto flex min-h-full max-w-3xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
      {error ? (
        <p className="text-red-600 dark:text-red-400">{error}</p>
      ) : (
        <p className="text-neutral-600 dark:text-neutral-400">
          Redirigiendo a Google…
        </p>
      )}
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-full max-w-3xl flex-1 flex-col gap-4 px-6 py-16">
          <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Cargando…</p>
        </main>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
