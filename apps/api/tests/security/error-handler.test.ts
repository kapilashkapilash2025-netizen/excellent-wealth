import Fastify from 'fastify';
import { describe, expect, it } from 'vitest';
import { registerErrorHandler } from '../../src/middleware/error-handler.js';
import { ValidationError } from '../../src/shared/errors.js';

/**
 * Exercises the error handler in isolation (a minimal Fastify instance, not
 * the full app) so these assertions are about the error-handling contract
 * itself, not incidental behaviour of any one route.
 */
async function buildMinimalApp() {
  const app = Fastify({ logger: false });
  registerErrorHandler(app);

  app.get('/boom', async () => {
    throw new Error('unexpected failure with sensitive detail: connection string user=admin');
  });
  app.get('/typed-error', async () => {
    throw new ValidationError('Bad input.', { field: 'email' });
  });
  app.get('/ok', async () => 'ok');

  await app.ready();
  return app;
}

describe('error handler security behaviour', () => {
  it('never includes a stack trace in the response for an unexpected error', async () => {
    const app = await buildMinimalApp();
    const response = await app.inject({ method: 'GET', url: '/boom' });

    expect(response.statusCode).toBe(500);
    const body = response.json();
    expect(JSON.stringify(body)).not.toMatch(/at .*\.js:\d+:\d+/); // no stack frame lines
    expect(JSON.stringify(body)).not.toContain('node_modules');
  });

  it('never leaks the raw internal error message for an unexpected error', async () => {
    const app = await buildMinimalApp();
    const response = await app.inject({ method: 'GET', url: '/boom' });
    expect(response.json().error.message).not.toMatch(/connection string|user=admin/);
    expect(response.json().error.code).toBe('INTERNAL_ERROR');
  });

  it('includes a requestId on every error response', async () => {
    const app = await buildMinimalApp();
    const response = await app.inject({ method: 'GET', url: '/boom' });
    expect(response.json().error.requestId).toEqual(expect.any(String));
    expect(response.json().error.requestId.length).toBeGreaterThan(0);
  });

  it('returns typed application errors with their intended code and message', async () => {
    const app = await buildMinimalApp();
    const response = await app.inject({ method: 'GET', url: '/typed-error' });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Bad input.' },
    });
  });

  it('returns a safe 404 body for unknown routes', async () => {
    const app = await buildMinimalApp();
    const response = await app.inject({ method: 'GET', url: '/does-not-exist' });
    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe('NOT_FOUND');
  });

  it('does not affect a successful route', async () => {
    const app = await buildMinimalApp();
    const response = await app.inject({ method: 'GET', url: '/ok' });
    expect(response.statusCode).toBe(200);
  });
});
