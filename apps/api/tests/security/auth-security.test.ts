import type { FastifyInstance } from 'fastify';
import pino from 'pino';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '../../src/database/prisma.js';
import { loggerConfig } from '../../src/config/logger.js';
import { createTestApp, resetDatabase } from '../integration/helpers.js';

const REGISTER_URL = '/api/v1/auth/register';
const LOGIN_URL = '/api/v1/auth/login';

const CREDENTIALS = {
  email: 'security.user@example.com',
  password: 'Str0ngPassphrase',
  confirmPassword: 'Str0ngPassphrase',
  displayName: 'Security User',
};

describe('auth security properties', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    await resetDatabase();
    app = await createTestApp();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('never returns the password hash in a registration response', async () => {
    const response = await app.inject({ method: 'POST', url: REGISTER_URL, payload: CREDENTIALS });
    const raw = JSON.stringify(response.json());
    expect(raw).not.toMatch(/argon2/);
    expect(raw).not.toContain(CREDENTIALS.password);
  });

  it('never returns the password hash in a login response', async () => {
    await app.inject({ method: 'POST', url: REGISTER_URL, payload: CREDENTIALS });
    const response = await app.inject({
      method: 'POST',
      url: LOGIN_URL,
      payload: { email: CREDENTIALS.email, password: CREDENTIALS.password },
    });
    expect(JSON.stringify(response.json())).not.toMatch(/argon2/);
  });

  it('never returns the raw session token in the JSON body', async () => {
    const response = await app.inject({ method: 'POST', url: REGISTER_URL, payload: CREDENTIALS });
    const cookie = response.cookies.find((c) => c.name === 'excellent_wealth_session');
    expect(cookie).toBeDefined();
    // The raw token lives only in the Set-Cookie header, never in the body.
    expect(JSON.stringify(response.json())).not.toContain(cookie!.value);
  });

  it('never persists the raw session token — only its hash — in the database', async () => {
    const response = await app.inject({ method: 'POST', url: REGISTER_URL, payload: CREDENTIALS });
    const cookie = response.cookies.find((c) => c.name === 'excellent_wealth_session');
    const session = await prisma.session.findFirst();
    expect(session?.tokenHash).not.toBe(cookie?.value);
    expect(session?.tokenHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("redacts password and token fields per the app's logger redaction config", () => {
    // Fastify doesn't log request bodies by default, so there's no request
    // to inject here — this instead verifies the redaction rules the app's
    // logger is actually configured with (src/config/logger.ts), the way
    // they'd apply if any code path ever does log a body or token.
    let output = '';
    const stream = {
      write: (chunk: string) => {
        output += chunk;
      },
    };
    const logger = pino({ ...loggerConfig, level: 'info' }, stream);

    logger.info({
      body: {
        email: CREDENTIALS.email,
        password: CREDENTIALS.password,
        confirmPassword: CREDENTIALS.password,
      },
      sessionToken: 'raw-token-value-should-not-appear',
    });

    expect(output).not.toContain(CREDENTIALS.password);
    expect(output).not.toContain('raw-token-value-should-not-appear');
    expect(output).toContain('[Redacted]');
  });

  it('rejects a JSON payload larger than the configured body limit', async () => {
    const oversizedDisplayName = 'a'.repeat(200 * 1024); // ~200 KiB, over the 100 KiB limit
    const response = await app.inject({
      method: 'POST',
      url: REGISTER_URL,
      payload: { ...CREDENTIALS, displayName: oversizedDisplayName },
    });
    expect(response.statusCode).toBe(413);
    expect(response.json().error.code).toBe('PAYLOAD_TOO_LARGE');
  });

  it('does not echo an untrusted CORS origin back in the response headers', async () => {
    const response = await app.inject({
      method: 'POST',
      url: LOGIN_URL,
      headers: { origin: 'https://evil.example' },
      payload: { email: CREDENTIALS.email, password: CREDENTIALS.password },
    });
    expect(response.headers['access-control-allow-origin']).not.toBe('https://evil.example');
  });

  it('echoes the configured web origin back for a trusted origin', async () => {
    const response = await app.inject({
      method: 'POST',
      url: LOGIN_URL,
      headers: { origin: 'http://localhost:3000' },
      payload: { email: CREDENTIALS.email, password: CREDENTIALS.password },
    });
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  it('sets standard secure headers via helmet', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('treats a SQL-injection-shaped string as inert data, not as SQL', async () => {
    const maliciousDisplayName = "Robert'); DROP TABLE users;--";
    const response = await app.inject({
      method: 'POST',
      url: REGISTER_URL,
      payload: { ...CREDENTIALS, displayName: maliciousDisplayName },
    });
    expect(response.statusCode).toBe(201);
    expect(response.json().data.user.displayName).toBe(maliciousDisplayName);

    // If the string had been interpreted as SQL, this table would be gone.
    const userCount = await prisma.user.count();
    expect(userCount).toBe(1);
  });

  it('rejects unknown top-level JSON properties on login', async () => {
    const response = await app.inject({
      method: 'POST',
      url: LOGIN_URL,
      payload: { email: CREDENTIALS.email, password: CREDENTIALS.password, isAdmin: true },
    });
    expect(response.statusCode).toBe(400);
  });

  it('applies strict rate limiting to repeated registration attempts from one client', async () => {
    const attempts = Array.from({ length: 15 }, (_, i) =>
      app.inject({
        method: 'POST',
        url: REGISTER_URL,
        payload: { ...CREDENTIALS, email: `flood-${i}@example.com` },
      }),
    );
    const responses = await Promise.all(attempts);
    expect(responses.some((r) => r.statusCode === 429)).toBe(true);
  });
});
