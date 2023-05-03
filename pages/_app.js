import 'react-toastify/dist/ReactToastify.min.css';
import './index.css';

import Head from 'next/head';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { cssTransition, ToastContainer } from 'react-toastify';
import RootStore, { RootStoreContext } from 'src/RootStore';
import api2 from 'src/utils/api2';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: ({ queryKey }) => api2.get(...(queryKey || [])),
    },
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <React.StrictMode>
      <Head>
        <title>random feeds</title>
      </Head>

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

      <QueryClientProvider client={queryClient}>
        <RootStoreContext.Provider value={new RootStore()}>
          <div style={{ margin: '0 auto', maxWidth: 666, lineHeight: 1.8, fontSize: 18 }}>
            <Component {...pageProps} />
          </div>
        </RootStoreContext.Provider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}
export default MyApp;
