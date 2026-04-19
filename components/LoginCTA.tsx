"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

interface LoginCTAProps {
  /**
   * Redirect destination after login (defaults to current path)
   */
  redirectTo?: string;
  /**
   * Custom message (defaults to Spanish)
   */
  message?: string;
  /**
   * Button text (defaults to Spanish)
   */
  buttonText?: string;
}

/**
 * Guest authentication gate component
 * Shows a message and button prompting user to log in
 * Preserves intent by passing redirectTo parameter
 */
export function LoginCTA({
  redirectTo,
  message = "Debes iniciar sesión para continuar.",
  buttonText = "Iniciar sesión",
}: LoginCTAProps) {
  const router = useRouter();
  const pathname = usePathname();
  const targetPath = redirectTo ?? pathname;

  function handleLogin() {
    const loginUrl = `/login?${new URLSearchParams({
      redirectTo: targetPath,
    }).toString()}`;
    router.push(loginUrl);
  }

  return (
    <div className="rounded-[20px] border border-blue-200 bg-blue-50 px-6 py-5">
      <p className="mb-4 text-sm text-blue-900">{message}</p>
      <Button onClick={handleLogin} variant="default">
        {buttonText}
      </Button>
    </div>
  );
}
