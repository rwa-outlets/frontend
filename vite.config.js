import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // UNISWAP_API_KEY deliberately has NO `VITE_` prefix: it must never be
  // inlined into the browser bundle. The dev proxy below injects it
  // server-side; in production the same rewrite lives in the host config
  // (nginx/vercel), see README "Uniswap API integration".
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        // Uniswap Trading API — same-origin proxy: the API has no CORS
        // preflight support (OPTIONS → 415), and the key stays off the client.
        '/api/uniswap': {
          target: 'https://trade-api.gateway.uniswap.org/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/uniswap/, ''),
          headers: {
            'x-api-key': env.UNISWAP_API_KEY ?? '',
            'x-universal-router-version': '2.0',
          },
        },
        // RWA Outlets backend (chat agent, /api/v1/*). Same-origin in dev via
        // this proxy; in production the ingress routes /api/* to the backend.
        // Note the backend defaults to port 3000 too — start it first and Vite
        // will auto-bump itself to 3001.
        '/api/v1': {
          target: env.BACKEND_URL || 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  }
})
