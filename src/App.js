import { observer } from 'mobx-react';
import React from 'react';
import { HashRouter, Route, Switch, useHistory } from 'react-router-dom';
import { cssTransition, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import api2 from 'src/utils/api2';

export default observer(function App() {
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

      <HashRouter>
        <HistoryGetter />

        <Switch>
          <Route
            path="/RecentlyReadItems"
            component={require('src/pages/RecentlyReadItemsPage').default}
          />
          <Route path="/Folder" component={require('src/pages/FolderPage').default} />
          <Route path="/Item" component={require('src/pages/ItemPage').default} />

          <Route path="/Login" component={require('src/pages/LoginPage').default} />
          <Route path="/" component={require('src/pages/IndexPage').default} />
        </Switch>
      </HashRouter>
    </div>
  );
});

function HistoryGetter() {
  const history = useHistory();

  React.useEffect(() => {
    api2.history = history;
  }, [history]);

  return null;
}
