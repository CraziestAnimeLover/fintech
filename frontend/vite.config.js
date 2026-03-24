export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  define: {
    'process.env': process.env,
  },
  build: {
    outDir: "dist"
  },
  server: {
    port: 3000,
    host: true,
    proxy: mode === 'development' ? {
      '/api': {
        target: 'https://fintech-6bvt.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    } : undefined
  }
}));