import { baseConfig } from './packages/config/eslint.base.js';

export default [
  ...baseConfig,
  {
    ignores: [
      '**/dist/**',
      '**/.next/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/next-env.d.ts',
      'pnpm-lock.yaml',
    ],
  },
];
