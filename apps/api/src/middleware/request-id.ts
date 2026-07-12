import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Generates the per-request ID Fastify attaches to `request.id` and echoes
 * in every response (success and error). Fastify calls this with the raw
 * IncomingMessage (the FastifyRequest wrapper doesn't exist yet at this
 * point). Trusts an inbound X-Request-Id header when present (useful behind
 * a gateway that already assigns one), otherwise mints a fresh UUID.
 */
export function generateRequestId(req: IncomingMessage): string {
  const inbound = req.headers[REQUEST_ID_HEADER];
  if (typeof inbound === 'string' && inbound.length > 0 && inbound.length <= 128) {
    return inbound;
  }
  return randomUUID();
}

export { REQUEST_ID_HEADER };
