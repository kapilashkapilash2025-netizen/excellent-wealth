import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import Fastify, { type FastifyInstance } from 'fastify';
import { getAllowedOrigins } from './config/env.js';
import { loggerConfig } from './config/logger.js';
import { registerErrorHandler } from './middleware/error-handler.js';
import { generateRequestId } from './middleware/request-id.js';
import { registerRateLimiting } from './middleware/rate-limit.js';
import { registerAuthRoutes } from './modules/auth/auth.routes.js';
import { registerHealthRoutes } from './modules/health/health.routes.js';

const JSON_BODY_LIMIT_BYTES = 100 * 1024; // 100 KiB — generous for auth payloads, small enough to blunt abuse.

/**
 * Builds a fully configured Fastify instance without starting it listening.
 * Kept separate from src/server.ts so tests can build and `.inject()` into
 * an app instance without binding a real network port.
 */
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: loggerConfig,
    genReqId: generateRequestId,
    bodyLimit: JSON_BODY_LIMIT_BYTES,
    trustProxy: true,
  });

  await app.register(helmet);
  await app.register(cors, {
    origin: getAllowedOrigins(),
    credentials: true,
  });
  await app.register(cookie);
  await registerRateLimiting(app);

  registerErrorHandler(app);

  await registerHealthRoutes(app);
  await registerAuthRoutes(app);

  return app;
}
