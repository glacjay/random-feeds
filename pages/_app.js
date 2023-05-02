import './index.css';

import Head from 'next/head';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
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

      <QueryClientProvider client={queryClient}>
        <RootStoreContext.Provider value={new RootStore()}>
          <Component {...pageProps} />
        </RootStoreContext.Provider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}
export default MyApp;
