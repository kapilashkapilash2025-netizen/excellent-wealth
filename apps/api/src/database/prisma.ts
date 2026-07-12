import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

/**
 * A single shared PrismaClient instance for the process lifetime. Creating
 * one per request would exhaust database connections under load.
 */
export const prisma = new PrismaClient({
  log:
    env.LOG_LEVEL === 'debug' || env.LOG_LEVEL === 'trace' ? ['query', 'error', 'warn'] : ['error'],
});

/** Lightweight connectivity check used by GET /ready. */
export async function isDatabaseReachable(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
