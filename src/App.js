import 'react-toastify/dist/ReactToastify.min.css';

import { observer } from 'mobx-react';
import React from 'react';
import { HashRouter, Route, Switch, useHistory } from 'react-router-dom';
import { cssTransition, ToastContainer } from 'react-toastify';
import api2 from 'src/utils/api2';

export default observer(function App() {
  return (
    <div style={{ lineHeight: 1.8, fontSize: 18 }}>
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

        <div style={{ margin: '0 auto', maxWidth: 666 }}>
          <Switch>
            <Route
              path="/RecentlyReadItems"
              component={require('src/pages/RecentlyReadItemsPage').default}
            />
          </Switch>
        </div>
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
