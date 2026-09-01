import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://json-byte.pages.dev',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
