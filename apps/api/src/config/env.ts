import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .refine((value) => value.startsWith('postgresql://') || value.startsWith('postgres://'), {
      message: 'DATABASE_URL must be a postgresql:// connection string',
    }),
  /** Comma-separated list of allowed web origins for CORS, e.g. "http://localhost:3000". */
  WEB_ORIGIN: z.string().min(1, 'WEB_ORIGIN is required'),
  SESSION_COOKIE_NAME: z.string().min(1).default('excellent_wealth_session'),
  SESSION_SECRET: z
    .string()
    .min(32, 'SESSION_SECRET must be at least 32 characters')
    .max(512, 'SESSION_SECRET must be at most 512 characters'),
  SESSION_TTL_HOURS: z.coerce.number().positive().default(168),
  /** Optional server-side pepper mixed into password hashing (defense in depth). */
  PASSWORD_PEPPER: z.string().max(256).default(''),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Parses and validates process.env, failing fast with a clear, secret-free
 * error message if required variables are missing or malformed. Called once
 * at startup (see src/server.ts) — never re-parses per request.
 */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    // Intentionally omit raw env values from this message — only variable
    // names and validation reasons, never secret contents, are logged.
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return result.data;
}

export const env = loadEnv();
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

/** Allowed CORS origins, parsed from the comma-separated WEB_ORIGIN variable. */
export function getAllowedOrigins(currentEnv: Env = env): string[] {
  return currentEnv.WEB_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}
