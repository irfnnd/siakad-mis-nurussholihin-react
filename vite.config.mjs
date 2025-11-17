import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const APP_BASE_URL = `${env.VITE_APP_BASE_URL}`;
  const PORT = 3000;
  return {
server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
    preview: {
      open: true,
      host: true
    },
    define: {
      global: 'window', 'process.env': {}
    },
    base: APP_BASE_URL,
    plugins: [react(), jsconfigPaths()]
  };
});

