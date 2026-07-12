import type { FastifyInstance } from 'fastify';
import { isDatabaseReachable } from '../../database/prisma.js';

/**
 * Health/readiness endpoints are intentionally outside the standard
 * { success, data } envelope — they're consumed by infrastructure probes
 * (load balancers, orchestrators), not API clients, and must stay minimal
 * and dependency-free to answer even when the rest of the app is unhealthy.
 */
export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async (_request, reply) => {
    reply.status(200).send({ status: 'ok' });
  });

  app.get('/ready', async (_request, reply) => {
    const databaseReachable = await isDatabaseReachable();
    if (!databaseReachable) {
      reply.status(503).send({ status: 'not_ready' });
      return;
    }
    reply.status(200).send({ status: 'ready' });
  });
}
