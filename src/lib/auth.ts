import type { AstroCookies } from 'astro';

export function getToken(cookies: AstroCookies): string | undefined {
  return cookies.get('token')?.value;
}

/**
 * Sanitize a `next` query parameter so we only ever redirect back to an
 * internal, relative URL. This blocks open-redirect targets (absolute or
 * protocol-relative URLs) and prevents bouncing straight back to `/login`.
 */
export function sanitizeNextUrl(next: string | null | undefined): string | null {
  if (!next) return null;
  if (!next.startsWith('/') || next.startsWith('//')) return null;
  if (next === '/login' || next.startsWith('/login?') || next.startsWith('/login/')) return null;
  return next;
}

/**
 * Build the URL unauthenticated visitors are redirected to, preserving the
 * page they were trying to view as a `next` parameter so we can send them back
 * after they sign in.
 */
export function loginRedirectUrl(currentUrl: URL): string {
  const next = currentUrl.pathname + currentUrl.search;
  return `/login?next=${encodeURIComponent(next)}`;
}

export function setToken(cookies: AstroCookies, token: string): void {
  cookies.set('token', token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export function deleteToken(cookies: AstroCookies): void {
  cookies.delete('token', { path: '/' });
}
