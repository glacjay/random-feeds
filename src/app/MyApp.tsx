'use client';

import '@mantine/core/styles.css';
import './index.css';

import { MantineProvider } from '@mantine/core';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ToastContainer } from 'react-toastify';

export default function MyApp({ children }) {
  return (
    <React.StrictMode>
      <MantineProvider theme={{ primaryColor: 'blue', defaultRadius: 'md' }}>
        <ToastContainer />

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
      </MantineProvider>
    </React.StrictMode>
  );
}
