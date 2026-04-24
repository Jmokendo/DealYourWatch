"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getRedirectIntent } from "@/lib/auth-utils";
import { LoginFormPanel } from "@/components/auth/LoginFormPanel";
import { LoginShowcasePanel } from "@/components/auth/LoginShowcasePanel";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);

    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    setBusy(false);

    if (!response.ok) {
      setError(data.error || "Error al iniciar sesion");
      return;
    }

    const redirectTo = getRedirectIntent(Object.fromEntries(searchParams));
    router.push(redirectTo);
  }

  return (
    <main className="min-h-screen bg-[#f6f5f2] px-5 py-5 sm:px-8 lg:px-12 lg:py-0">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-[1380px] overflow-hidden rounded-[28px] border border-black/[0.08] bg-white shadow-[0_30px_80px_-55px_rgba(17,17,17,0.35)] lg:min-h-screen lg:grid-cols-[0.58fr_0.42fr] lg:rounded-none lg:border-x lg:border-y-0 lg:shadow-none">
        <LoginShowcasePanel />
        <LoginFormPanel
          email={email}
          password={password}
          error={error}
          busy={busy}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  );
}
