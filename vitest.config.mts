import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '#': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    testTimeout: 100_000,
    coverage: {
      provider: 'v8', // or 'v8'
      all: false,
    },
    exclude: ['node_modules', 'examples'],
  },
});
