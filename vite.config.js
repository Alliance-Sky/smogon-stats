import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  ssr: { noExternal: true },
  plugins: [preact()],
  build: {
    target: 'esnext',
    cssMinify: 'lightningcss',
    minify: 'esbuild',
    esbuildOptions: {
      legalComments: 'none',
      drop: ['console', 'debugger'],
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/preact/')) {
            return 'vendor';
          }
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 10000,
    allowedHosts: true
  },
  preview: {
    host: '0.0.0.0',
    port: 10000,
    allowedHosts: true
  }
});

