import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  define: {
    'process.env': process.env, // optional for accessing env vars
  },
//  server: {
//   proxy: {
//     "/api": {
//       target: "http://localhost:5000",
//       changeOrigin: true,
//       secure: false,
//     },
//   },
// }
}));