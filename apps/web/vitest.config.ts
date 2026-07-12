import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'jsdom',
    include: ['app/**/*.test.tsx', 'components/**/*.test.tsx'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
