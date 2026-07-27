import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { QueryClient, QueryClientProvider, HydrationBoundary } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  },
});

ReactDOM.hydrateRoot(document.getElementById('root'),
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={window.__REACT_QUERY_STATE__}>
        <App />
      </HydrationBoundary>
    </QueryClientProvider>
  </React.StrictMode>
)
