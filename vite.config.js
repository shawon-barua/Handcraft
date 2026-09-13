/**
 * Copyright (c) 2026 Shawon Barua (shawon.cse.ku@gmail.com)
 * All rights reserved.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5005',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:5005',
        changeOrigin: true
      }
    }
  }
});
