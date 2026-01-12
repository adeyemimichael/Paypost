import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {},
    'process.browser': true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        intro: `
          if (typeof globalThis !== 'undefined') {
            globalThis.Request = globalThis.Request || (typeof Request !== 'undefined' ? Request : undefined);
            globalThis.Response = globalThis.Response || (typeof Response !== 'undefined' ? Response : undefined);
            globalThis.Headers = globalThis.Headers || (typeof Headers !== 'undefined' ? Headers : undefined);
            globalThis.fetch = globalThis.fetch || (typeof fetch !== 'undefined' ? fetch : undefined);
          }
        `
      }
    }
  },
  server: {
    proxy: {
      '/api/movement': {
        target: 'https://testnet.movementnetwork.xyz',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/movement/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
})