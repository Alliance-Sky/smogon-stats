import { create } from 'zustand';

const getInitialTheme = () => {
  return 'scarlet';
};

const getInitialStateFromQuery = () => {
  if (typeof window !== 'undefined' && window.__REACT_QUERY_STATE__) {
    try {
      const queries = window.__REACT_QUERY_STATE__.queries;
      const statsQuery = queries.find(q => q.queryKey && q.queryKey[0] === 'stats');
      if (statsQuery && statsQuery.queryKey.length >= 4) {
        return {
          defaultMonth: statsQuery.queryKey[1],
          defaultFormat: statsQuery.queryKey[2],
          defaultRating: statsQuery.queryKey[3]
        };
      }
    } catch(e) {}
  }
  return null;
};

const getParam = (key, defaultVal) => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.has(key)) return params.get(key);
    
    const initState = getInitialStateFromQuery();
    if (initState) {
      if (key === 'period' && initState.defaultMonth) return initState.defaultMonth;
      if (key === 'format' && initState.defaultFormat) return initState.defaultFormat;
      if (key === 'rating' && initState.defaultRating) return initState.defaultRating;
    }
  }
  return defaultVal;
};

export const useStore = create((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    if (typeof document !== 'undefined') {
      document.cookie = `theme=${theme};path=/;max-age=31536000`;
    }
    set({ theme });
  },

  period: getParam('period', '2026-06'),
  setPeriod: (period) => set({ period }),

  format: getParam('format', 'gen9ou'),
  setFormat: (format) => set({ format }),

  rating: getParam('rating', '1760'),
  setRating: (rating) => set({ rating })
}));
