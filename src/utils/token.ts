import { cookies } from 'next/headers';

export function getToken() {
  return cookies().get('token')?.value;
}

export function setToken(token: string) {
  cookies().set('token', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
  });
}
