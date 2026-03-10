'use client';

import { ErrorBoundary } from 'react-error-boundary';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ErrorFallback({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : 'An unknown error occurred';

  return (
    <div role="alert" style={{ padding: '20px', background: '#fff0f0', border: '1px solid red', borderRadius: '8px' }}>
      <h1>Something went wrong</h1>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{message}</pre>
    </div>
  );
}

export function GlobalProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {children}
    </ErrorBoundary>
  );
}
