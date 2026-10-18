import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Remove console.* e debugger do bundle de produção (console limpo em produção)
  esbuild: mode === 'production' ? { drop: ['console', 'debugger'] } : undefined,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: false,
  },
}));
