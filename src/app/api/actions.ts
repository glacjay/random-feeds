'use server';

import { redirect } from 'next/navigation';
import qs from 'qs';

import { FEVER_API_ENDPOINT } from '@/utils/api2';
import { setToken } from '@/utils/token';

export async function login(formData: FormData) {
  const response = await fetch(`${FEVER_API_ENDPOINT}/accounts/ClientLogin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: qs.stringify({
      Email: formData.get('username'),
      Passwd: formData.get('password'),
    }),
  });
  const result = await response.text();

  const json: { Auth?: string } = {};
  result
    .split('\n')
    .filter((l) => l)
    .forEach((line) => {
      const idx = line.indexOf('=');
      if (idx > 0) {
        json[line.substr(0, idx)] = line.substr(idx + 1);
      } else {
        json[line] = true;
      }
    });

  if (!json.Auth) throw new Error('account or password incorrect');
  setToken(json.Auth);

  redirect('/');
}
