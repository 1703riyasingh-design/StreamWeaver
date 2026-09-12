import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5190,
    strictPort: false,
    open: true,
  },
  build: {
    // Disable source maps in production (prevents code inspection)
    sourcemap: false,
    // Minify with esbuild (faster than terser, decent compression)
    minify: 'esbuild',
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1500,
    // Remove console logs and debugger statements in production
    esbuild: {
      drop: ['console', 'debugger'],
      legalComments: 'none',
    },
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          socket: ['socket.io-client'],
          xlsx: ['xlsx'],
          window: ['react-window'],
        },
      },
    },
  },
  // Security: prevent directory listing
  preview: {
    port: 5190,
    strictPort: false,
  },
});