import { cookies } from 'next/headers';

import { setCookie } from './cookies';

export function getToken() {
  return cookies().get('token')?.value;
}

export function setToken(token: string) {
  setCookie('token', token);
}
