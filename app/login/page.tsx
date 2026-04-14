"use client";

import { signIn, useSession } from "next-auth/react";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

function mapAuthError(code: string | null | undefined): string | null {
  if (!code) return null;
  const known: Record<string, string> = {
    Configuration:
      "Hay un problema de configuración del servidor. Comprobá NEXTAUTH_SECRET (o AUTH_SECRET) y las variables de Google OAuth.",
    AccessDenied: "Acceso denegado. No pudimos completar el inicio de sesión con Google.",
    Verification: "El enlace de verificación expiró o ya fue usado. Probá de nuevo.",
    OAuthSignin: "No se pudo conectar con Google. Reintentá en unos minutos.",
    OAuthCallback: "Google devolvió un error al volver a la app. Reintentá iniciar sesión.",
    OAuthCreateAccount: "No pudimos crear o vincular tu cuenta. Contactá soporte si persiste.",
    Callback: "Algo salió mal en el callback de autenticación. Probá de nuevo.",
    SessionRequired: "Tenés que iniciar sesión para ver esa página.",
    Default: "No se pudo iniciar sesión. Probá de nuevo.",
  };
  return known[code] ?? known.Default;
}

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const urlError = searchParams.get("error");
  const { status } = useSession();
  const [error, setError] = useState<string | null>(() =>
    mapAuthError(urlError),
  );
  const [oauthRedirecting, setOauthRedirecting] = useState(false);

  useEffect(() => {
    setError(mapAuthError(urlError));
  }, [urlError]);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [callbackUrl, router, status]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    void fetch("/api/auth/providers")
      .then((r) => r.json())
      .then((providers) => {
        console.log("[login] GET /api/auth/providers:", providers);
        if (!providers?.google) {
          console.warn(
            "[login] Server did not expose a `google` provider. signIn(\"google\", { redirect: false }) may return undefined and rely on window.location (see next-auth react signIn).",
          );
        }
      })
      .catch((e) => {
        console.error("[login] Failed to fetch /api/auth/providers", e);
      });
  }, []);

  const handleGoogle = useCallback(async () => {
    setError(null);
    setOauthRedirecting(true);
    try {
      const result = await signIn("google", {
        callbackUrl,
        redirect: false,
      });

      console.log("[login/signIn] raw result:", result);
      if (result && typeof result === "object") {
        console.log("[login/signIn] result.ok:", result.ok);
        console.log("[login/signIn] result.status:", result.status);
        console.log("[login/signIn] result.error:", result.error);
        console.log("[login/signIn] result.code:", result.code);
        console.log("[login/signIn] result.url:", result.url);
      }

      if (result === undefined) {
        console.warn(
          "[login/signIn] result is undefined — next-auth assigned window.location internally (e.g. missing providers, unknown provider, or providers fetch failed). If the page did not navigate, reset state so the user can retry.",
        );
        setOauthRedirecting(false);
        setError(
          "El inicio de sesión no devolvió una URL (signIn undefined). Revisá la consola y que el servidor tenga GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET cargados; recargá la página e intentá de nuevo.",
        );
        return;
      }
      if (!result.ok || result.error) {
        console.warn("[login/signIn] signIn failed:", {
          ok: result.ok,
          error: result.error,
          code: result.code,
          status: result.status,
        });
        setError(mapAuthError(result.error) ?? "No se pudo iniciar sesión con Google.");
        setOauthRedirecting(false);
        return;
      }
      if (result.url) {
        console.log("[login/signIn] navigating to:", result.url);
        window.location.href = result.url;
        return;
      }
      console.warn("[login/signIn] result.ok but result.url is null/empty");
      setError(
        "El servidor no generó una URL de redirección (result.url vacío). Revisá la consola y la configuración de Google OAuth.",
      );
      setOauthRedirecting(false);
    } catch (err) {
      console.error("[login/signIn] threw:", err);
      setError(
        "No se pudo iniciar el inicio de sesión. Comprobá la conexión y las variables de entorno de Google OAuth y NEXTAUTH_SECRET (o AUTH_SECRET).",
      );
      setOauthRedirecting(false);
    }
  }, [callbackUrl]);

  const sessionBusy = status === "loading";
  const postAuthRedirect = status === "authenticated";

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-1 flex-col gap-6 px-6 py-16">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Usamos solo Google. No hace falta crear una contraseña aparte.
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

      {postAuthRedirect ? (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Volviendo a la app…
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={sessionBusy || oauthRedirecting || postAuthRedirect}
          onClick={() => void handleGoogle()}
        >
          {oauthRedirecting ? "Redirigiendo a Google…" : "Continue with Google"}
        </Button>
        {sessionBusy && !oauthRedirecting && !postAuthRedirect ? (
          <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
            Comprobando si ya tenés sesión…
          </p>
        ) : null}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-full max-w-md flex-1 flex-col gap-6 px-6 py-16">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Usamos solo Google. No hace falta crear una contraseña aparte.
            </p>
          </div>
          <Button type="button" size="lg" className="w-full" disabled>
            Continue with Google
          </Button>
          <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
            Cargando…
          </p>
        </main>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
