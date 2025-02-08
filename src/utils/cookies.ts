import { cookies } from 'next/headers';

export function setCookie(name, value, options = {}) {
  cookies().set(name, value, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    ...options,
  });
}
