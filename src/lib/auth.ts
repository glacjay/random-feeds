import type { AstroCookies } from 'astro';

export function getToken(cookies: AstroCookies): string | undefined {
  return cookies.get('token')?.value;
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
