'use client';

import 'react-toastify/dist/ReactToastify.min.css';
import './index.css';

import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
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

export default function MyApp({ children }) {
  return (
    <React.StrictMode>
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
            <ErrorBoundary
              fallbackRender={({ error, resetErrorBoundary }) => (
                <div>
                  <h1>Something went wrong</h1>
                  <pre style={{ whiteSpace: 'pre-wrap' }}>{error.message}</pre>
                  <button onClick={resetErrorBoundary}>Try again</button>
                  <button onClick={() => localStorage.removeItem('token')}>Clear token</button>
                </div>
              )}
            >
              {children}
            </ErrorBoundary>
          </div>
        </RootStoreContext.Provider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}
