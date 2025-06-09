import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
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
    },
  },
});
