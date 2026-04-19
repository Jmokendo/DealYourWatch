export function getRedirectIntent(
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const redirectTo = searchParams["redirectTo"];
  if (typeof redirectTo !== "string") return "/";

  if (redirectTo.startsWith("/")) {
    return decodeURIComponent(redirectTo);
  }

  return "/";
}

export function createLoginRedirectUrl(currentPath: string): string {
  return `/login?${new URLSearchParams({
    redirectTo: currentPath,
  }).toString()}`;
}
