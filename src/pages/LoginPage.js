import md5 from 'md5';
import * as mobx from 'mobx';
import { observer, useLocalObservable } from 'mobx-react';
import React from 'react';
import { toast } from 'react-toastify';
import api2 from 'src/utils/api2';
import useGlobalStore from 'src/utils/globalStore';

export default observer(function LoginPage(props) {
  const globalStore = useGlobalStore();

  const state = useLocalObservable(() => ({
    account: null,
    password: null,
    isSubmitting: false,

    *login() {
      try {
        state.isSubmitting = true;
        const token = md5(`${state.account}:${state.password}`);
        const result = yield api2.post('?api', { api_key: token });
        if (!result.auth) {
          toast('auth failed');
          return;
        }
        globalStore.setToken(token);
        yield localStorage.setItem('token', token);
        props.history.goBack();
      } catch (ex) {
      } finally {
        state.isSubmitting = false;
      }
    },
  }));

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
      <input
        value={state.account ?? ''}
        onChange={mobx.action((e) => (state.account = e.target.value || null))}
      />

      <div>password</div>
      <input
        value={state.password ?? ''}
        onChange={mobx.action((e) => (state.password = e.target.value || null))}
      />

      <button
        onClick={state.login}
        disabled={state.isSubmitting}
        style={{ gridColumn: '1 / span 2', padding: 8, fontSize: 14 }}
      >
        login
      </button>
    </div>
  );
});
