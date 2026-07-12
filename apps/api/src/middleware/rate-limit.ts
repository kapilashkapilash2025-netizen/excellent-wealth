import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';
import { RateLimitError } from '../shared/errors.js';

/** General API-wide ceiling. Individual routes may layer a stricter limit on top. */
const GLOBAL_RATE_LIMIT = { max: 100, timeWindow: '1 minute' };

/** Applied to registration and login — the endpoints most attractive to abuse. */
export const AUTH_RATE_LIMIT_CONFIG = {
  rateLimit: { max: 10, timeWindow: '1 minute' },
};

export async function registerRateLimiting(app: FastifyInstance): Promise<void> {
  await app.register(rateLimit, {
    global: true,
    max: GLOBAL_RATE_LIMIT.max,
    timeWindow: GLOBAL_RATE_LIMIT.timeWindow,
    // @fastify/rate-limit `throw`s whatever this returns, so it must be a
    // real Error carrying `.statusCode` — the central error handler then
    // maps it to our standard envelope like any other AppError.
    errorResponseBuilder: () => new RateLimitError(),
  });
}
