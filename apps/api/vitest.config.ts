import { config as loadDotenv } from 'dotenv';
import { defineConfig } from 'vitest/config';

const parsed = loadDotenv({ path: '.env.test' }).parsed ?? {};

// Only fill in variables that aren't already set in the real environment,
// so CI (which sets DATABASE_URL etc. via workflow `env:`) always wins over
// these committed local-test defaults.
const fallbackEnv = Object.fromEntries(
  Object.entries(parsed).filter(([key]) => process.env[key] === undefined),
);

export default defineConfig({
  test: {
    environment: 'node',
    env: fallbackEnv,
    include: ['tests/**/*.test.ts'],
    testTimeout: 15000,
    hookTimeout: 15000,
    // Integration/security tests share one real Postgres database — running
    // test files concurrently causes one file's resetDatabase() to wipe rows
    // another file is mid-assertion on. Unit tests don't touch the DB, so
    // this only costs wall-clock time, not correctness.
    fileParallelism: false,
  },
});
