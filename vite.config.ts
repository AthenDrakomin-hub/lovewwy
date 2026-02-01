
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Use relative base so built assets reference relative paths (good for subpath/static hosting)
  base: './',
  plugins: [react()],
  // Only inline minimal and safe environment values. Avoid exposing the whole `process.env` to the client
  // Use `import.meta.env.VITE_*` for public variables instead.
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Increase warning limit for large chunks (in KB). Adjust as needed.
    chunkSizeWarningLimit: 2000
  }
});
