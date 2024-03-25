import React from 'react';

import { login } from '@/app/api/actions';

export default function Page() {
  return (
    <form action={login}>
      <input name="username" type="text" placeholder="Username" required />
      <input name="password" type="password" placeholder="Password" required />
      <LoginButton />
    </form>
  );
}

function LoginButton() {
  return <button type="submit">Login</button>;
}
