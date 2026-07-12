import type { FastifyInstance } from 'fastify';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '../../src/database/prisma.js';
import { createTestApp, extractSessionToken, resetDatabase } from './helpers.js';

const REGISTER_URL = '/api/v1/auth/register';
const LOGOUT_URL = '/api/v1/auth/logout';
const ME_URL = '/api/v1/auth/me';
const COOKIE_NAME = 'excellent_wealth_session';

describe('POST /api/v1/auth/logout', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    await resetDatabase();
    app = await createTestApp();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function registerAndGetToken() {
    const response = await app.inject({
      method: 'POST',
      url: REGISTER_URL,
      payload: {
        email: 'logout.user@example.com',
        password: 'Str0ngPassphrase',
        confirmPassword: 'Str0ngPassphrase',
        displayName: 'Logout User',
      },
    });
    const token = extractSessionToken(response.headers['set-cookie'], COOKIE_NAME);
    if (!token) throw new Error('expected a session cookie in the register response');
    return token;
  }

  it('logs out successfully and clears the cookie', async () => {
    const token = await registerAndGetToken();
    const response = await app.inject({
      method: 'POST',
      url: LOGOUT_URL,
      cookies: { [COOKIE_NAME]: token },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().success).toBe(true);

    const clearedCookie = response.cookies.find((c) => c.name === COOKIE_NAME);
    expect(clearedCookie?.value).toBe('');
  });

  it('revokes the session server-side', async () => {
    const token = await registerAndGetToken();
    await app.inject({ method: 'POST', url: LOGOUT_URL, cookies: { [COOKIE_NAME]: token } });

    const session = await prisma.session.findFirst();
    expect(session?.revokedAt).not.toBeNull();
  });

  it('rejects reuse of a revoked token against /me', async () => {
    const token = await registerAndGetToken();
    await app.inject({ method: 'POST', url: LOGOUT_URL, cookies: { [COOKIE_NAME]: token } });

    const response = await app.inject({
      method: 'GET',
      url: ME_URL,
      cookies: { [COOKIE_NAME]: token },
    });
    expect(response.statusCode).toBe(401);
  });

  it('succeeds even with no session cookie at all', async () => {
    const response = await app.inject({ method: 'POST', url: LOGOUT_URL });
    expect(response.statusCode).toBe(200);
    expect(response.json().success).toBe(true);
  });

  it('succeeds on repeated logout calls (idempotent)', async () => {
    const token = await registerAndGetToken();
    const first = await app.inject({
      method: 'POST',
      url: LOGOUT_URL,
      cookies: { [COOKIE_NAME]: token },
    });
    const second = await app.inject({
      method: 'POST',
      url: LOGOUT_URL,
      cookies: { [COOKIE_NAME]: token },
    });
    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
  });

  it('records a logout audit event', async () => {
    const token = await registerAndGetToken();
    await app.inject({ method: 'POST', url: LOGOUT_URL, cookies: { [COOKIE_NAME]: token } });
    const events = await prisma.auditEvent.findMany({ where: { eventType: 'LOGOUT' } });
    expect(events).toHaveLength(1);
  });
});
