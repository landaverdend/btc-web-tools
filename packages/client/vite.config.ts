import { defineConfig, ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import svgr from 'vite-plugin-svgr';

// Stupid workaround to get SPA
const spaFallback = () => ({
  name: 'spa-fallback',
  configureServer(server: ViteDevServer) {
    server.middlewares.use((req, _, next) => {
      if (req.url?.startsWith('/txbuilder')) {
        req.url = '/';
      }
      next();
    });
  },
});

export default defineConfig({
  plugins: [react(), svgr(), spaFallback()],
  server: {
    port: 3000,
    proxy: {
      '/tx': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/address': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
    middlewareMode: false,
  },
  envDir: path.resolve(__dirname, './'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@views': path.resolve(__dirname, './src/views'),
      '@state': path.resolve(__dirname, './src/state'),
      '@service': path.resolve(__dirname, './src/service'),
      '@assets': path.resolve(__dirname, './public/'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@btclib': path.resolve(__dirname, './src/btclib'),
      '@api': path.resolve(__dirname, './src/api'),
    },
  },
});
