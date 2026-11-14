import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy CMS API calls in dev to avoid CORS from localhost.
      // Set VITE_CMS_API_BASE_URL=/cms-proxy in .env.local to activate.
      '/cms-proxy': {
        target: 'https://otci-cms-api.mydeslynkpartners.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cms-proxy/, ''),
      },
    },
  },
  build: { assetsInlineLimit: 0 },
});
