import { observer } from 'mobx-react';
import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import useRootStore from 'src/utils/rootStore';

export default observer(function App() {
  const rootStore = useRootStore();
  const { token } = rootStore.persisted;

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/Login" component={require('src/pages/LoginPage').default} />
        <Route path="/" component={require('src/pages/IndexPage').default} />
      </Switch>
    </BrowserRouter>
  );
});
