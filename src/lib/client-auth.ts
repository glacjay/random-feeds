// Client-side auth helpers. Only imported from `'use client'` components —
// `window` is accessed lazily inside functions so importing this module never
// touches the browser global during SSR/build.

function currentPathWithQuery(): string {
  return window.location.pathname + window.location.search;
}

/**
 * Navigate to the login page, preserving the current URL as a `next`
 * parameter so the user returns to where they were after signing in.
 *
 * Uses `location.assign` (a normal navigation that adds a history entry)
 * rather than `location.replace`, so the page the user was on is not lost.
 */
export function redirectToLogin(): void {
  const next = encodeURIComponent(currentPathWithQuery());
  window.location.assign(`/login?next=${next}`);
}

/**
 * Handle a 401 (missing/expired token) response from a protected API route.
 * Redirects to the login page and returns `true` when the caller should stop.
 * Returns `false` for any other status so callers can keep their own handling.
 */
export function redirectIfUnauthorized(status: number): boolean {
  if (status !== 401) return false;
  redirectToLogin();
  return true;
}
