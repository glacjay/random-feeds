import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { useRouter } from 'next/router';
import React, { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { useToken } from 'src/data';
import { useRootStore } from 'src/RootStore';
import api2 from 'src/utils/api2';

export default observer(function LoginPage() {
  const router = useRouter();
  const rootStore = useRootStore();
  const [token, setToken] = useToken();

  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);

  const login = useCallback(() => {
    runInAction(async () => {
      try {
        rootStore.isSubmitting = true;

        const result = await api2.post('/accounts/ClientLogin', {
          Email: username,
          Passwd: password,
        });

        const json = {};
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
        if (!json.Auth) {
          throw new Error('account or password incorrect');
        }

        const token = json.Auth;
        setToken(token);
        router.back();
      } catch (ex) {
        console.warn('LoginPage.login error:', ex);
        toast(`login failed: ${ex}`);
      } finally {
        rootStore.isSubmitting = false;
      }
    });
  }, [password, rootStore, router, setToken, username]);

  return (
    <div
      style={{
        margin: 16,
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        rowGap: 16,
        columnGap: 16,
      }}
    >
      <div>account</div>
      <input value={username ?? ''} onChange={(e) => setUsername(e.target.value || null)} />

      <div>password</div>
      <input
        type="password"
        value={password ?? ''}
        onChange={(e) => setPassword(e.target.value || null)}
      />

      <button
        onClick={login}
        disabled={rootStore.isSubmitting}
        style={{ gridColumn: '1 / span 2', padding: 8, fontSize: 14 }}
      >
        login
      </button>

      <div style={{ gridColumn: '1 / span 2' }}>{token?.length}</div>
    </div>
  );
});
