import { create } from 'zustand';

const getInitialTheme = () => {
  const match = document.cookie.match(/(^| )theme=([^;]+)/);
  if (match) return match[2];
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'violet';
  }
  return 'scarlet';
};

const params = new URLSearchParams(window.location.search);

export const useStore = create((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    document.cookie = `theme=${theme};path=/;max-age=31536000`;
    set({ theme });
  },

  period: params.get('period') || '2026-06',
  setPeriod: (period) => set({ period }),

  format: params.get('format') || 'gen9ou',
  setFormat: (format) => set({ format }),

  rating: params.get('rating') || '1760',
  setRating: (rating) => set({ rating })
}));
