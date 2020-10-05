import * as mobx from 'mobx';
import { observer } from 'mobx-react';
import React, { Fragment } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { cssTransition, ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import useGlobalStore from 'src/utils/globalStore';

const PERSISTED_KEY = 'globalStore';

export default observer(function App() {
  const globalStore = useGlobalStore();
  const { token } = globalStore.persisted;

  React.useEffect(() => {
    const loadPersisted = async () => {
      try {
        let persisted = null;
        const persistedJson = await localStorage.getItem(PERSISTED_KEY);
        console.log('xxx load persisted', persistedJson);
        if (persistedJson) {
          persisted = JSON.parse(persistedJson);
        }
        globalStore.setPersisted({ ...persisted, isLoaded: true });

        const token = await localStorage.getItem('token');
        globalStore.setToken(token);
      } catch (ex) {
        console.warn('App.loadPersisted error:', ex);
        toast(`加载离线存储出错：${ex}`);
      }
    };
    loadPersisted();
  }, [globalStore]);

  React.useEffect(
    () =>
      mobx.reaction(
        () => globalStore.persisted,
        async (persisted) => {
          console.log('xxx reaction', mobx.toJS(persisted));
          if (persisted?.isLoaded) {
            await localStorage.setItem(PERSISTED_KEY, JSON.stringify(persisted));
          }
        },
      ),
    [globalStore],
  );

  return (
    <Fragment>
      <ToastContainer
        autoClose={4000}
        closeButton={false}
        transition={cssTransition({
          enter: 'slideInDown',
          exit: 'slideOutUp',
          duration: 300,
        })}
        hideProgressBar
        toastClassName="toast-border"
        bodyClassName="toast-body"
      />

      <BrowserRouter>
        <Switch>
          <Route path="/Group/:groupId" component={require('src/pages/GroupPage').default} />
          <Route path="/Item/:itemId" component={require('src/pages/ItemPage').default} />

          <Route path="/Login" component={require('src/pages/LoginPage').default} />
          <Route path="/" component={require('src/pages/IndexPage').default} />
        </Switch>
      </BrowserRouter>
    </Fragment>
  );
});
