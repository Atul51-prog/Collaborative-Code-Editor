import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
    process: { env: { NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production') } },
  },
  server: {
    proxy: {
      '/login': 'http://localhost:5000',
      '/register': 'http://localhost:5000',
      '/checkforUser': 'http://localhost:5000',
      '/roomsforuser': 'http://localhost:5000',
      '/logout': 'http://localhost:5000',
      '/ai': 'http://localhost:5000',
      '/execute': 'http://localhost:5000',
      '/forgot-password': 'http://localhost:5000',
      '/verify-reset-code': 'http://localhost:5000',
      '/reset-password': 'http://localhost:5000',
    },
  },
});
