import { observer } from 'mobx-react';
import React from 'react';
import { useRootStore } from 'src/RootStore';

export default observer(function LoginPage(props) {
  const rootStore = useRootStore();

  const [state, setState] = React.useState({
    account: null,
    password: null,
    isSubmitting: false,
  });

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
        onChange={(e) => setState({ ...state, account: e.target.value || null })}
      />

      <div>password</div>
      <input
        type="password"
        value={state.password ?? ''}
        onChange={(e) => setState({ ...state, password: e.target.value || null })}
      />

      <button
        onClick={async () => {
          setState({ ...state, isSubmitting: true });
          if (await rootStore.login(state.account, state.password)) {
            props.history.goBack();
          }
          setState({ ...state, isSubmitting: false });
        }}
        disabled={state.isSubmitting}
        style={{ gridColumn: '1 / span 2', padding: 8, fontSize: 14 }}
      >
        login
      </button>
    </div>
  );
});
