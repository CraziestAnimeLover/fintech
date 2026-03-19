import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  define: {
    'process.env': process.env, // optional for accessing env vars
  },
  server: {
    port: 3000,
    host: true, // exposes dev server to network (useful for devices/Docker)
    proxy: mode === 'development' ? {
      '/api': {
        target: 'http://localhost:5000', // backend port
        changeOrigin: true,
        secure: false, // avoid SSL issues in dev
        rewrite: path => path.replace(/^\/api/, '/api'), // keeps /api path intact
      }
    } : undefined
  }
}));