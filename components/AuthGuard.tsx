"use client";

import { ReactNode } from "react";
import { LoginCTA } from "@/components/LoginCTA";

interface AuthGuardProps {
  /**
   * Content to show if authenticated
   */
  children: ReactNode;
  /**
   * Whether user is authenticated
   */
  isAuthenticated: boolean;
  /**
   * Fallback to show if not authenticated (defaults to LoginCTA)
   */
  fallback?: ReactNode;
  /**
   * Redirect destination after login
   */
  redirectTo?: string;
}

/**
 * Conditional auth wrapper for protected content
 * Shows fallback/LoginCTA to guests, children to authenticated users
 */
export function AuthGuard({
  children,
  isAuthenticated,
  fallback,
  redirectTo,
}: AuthGuardProps) {
  if (!isAuthenticated) {
    return (
      fallback ?? (
        <LoginCTA
          redirectTo={redirectTo}
          message="Debes iniciar sesión para realizar esta acción."
        />
      )
    );
  }

  return children;
}
