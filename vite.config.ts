/* eslint-disable import-x/no-default-export */
import path from 'path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/*.spect.ts', '**/*.spec.tsx'],
    }),
  ],
  resolve: {
    alias: {
      '#': path.resolve(__dirname, './src'),
    },
  },
});
