import React from 'react'
import ReactDOMServer from 'react-dom/server'
import App from './App.jsx'
import { QueryClient, QueryClientProvider, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { getMonths, getFormats, getStats, getMetagame, getTotalBattles, getInit } from './utils/api';

export async function prefetch() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: Infinity } },
  });

  const init = await getInit();
  if (init) {
    const period = init.defaultMonth || '2026-06';
    const format = init.defaultFormat || 'gen9ou';
    const rating = init.defaultRating || '1760';

    if (init.metagame) queryClient.setQueryData(['metagame', period, format, rating], init.metagame);
    if (init.totalBattles !== undefined) queryClient.setQueryData(['totalBattles', period, format, rating], init.totalBattles);

    await Promise.all([
      queryClient.prefetchQuery({ queryKey: ['months'], queryFn: getMonths }),
      queryClient.prefetchQuery({ queryKey: ['formats', period], queryFn: () => getFormats(period) }),
      queryClient.prefetchQuery({ queryKey: ['stats', period, format, rating], queryFn: () => getStats(period, format, rating) })
    ]);
  }
  return dehydrate(queryClient);
}

import { useStore } from './store.js';

export function render(url, dehydratedState) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: Infinity,
      },
    },
  });

  if (dehydratedState) {
    try {
      const statsQuery = dehydratedState.queries.find(q => q.queryKey && q.queryKey[0] === 'stats');
      if (statsQuery && statsQuery.queryKey.length >= 4) {
        useStore.setState({
          period: statsQuery.queryKey[1],
          format: statsQuery.queryKey[2],
          rating: statsQuery.queryKey[3]
        });
      }
    } catch (e) {}
  }

  const staticLocationHook = () => [url, () => {}];

  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={dehydratedState}>
          <Router hook={staticLocationHook}>
            <App />
          </Router>
        </HydrationBoundary>
      </QueryClientProvider>
    </React.StrictMode>
  )
  return { html }
}
