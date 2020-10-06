import { observer } from 'mobx-react';
import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { cssTransition, ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { useRootStore } from 'src/RootStore';

export default observer(function App() {
  const rootStore = useRootStore();

  React.useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await localStorage.getItem('token');
        rootStore.loadToken(token);
      } catch (ex) {
        console.warn('App.loadToken error:', ex);
        toast(`load storage error: ${ex}`);
      }
    };
    loadToken();
  }, [rootStore]);

  return (
    <div>
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

      <BrowserRouter basename="/random-feeds">
        <Switch>
          <Route path="/Folder" component={require('src/pages/FolderPage').default} />
          <Route path="/Item" component={require('src/pages/ItemPage').default} />

          <Route path="/Login" component={require('src/pages/LoginPage').default} />
          <Route path="/" component={require('src/pages/IndexPage').default} />
        </Switch>
      </BrowserRouter>
    </div>
  );
});
