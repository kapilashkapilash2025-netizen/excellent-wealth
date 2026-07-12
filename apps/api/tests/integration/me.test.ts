import type { FastifyInstance } from 'fastify';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '../../src/database/prisma.js';
import { createTestApp, extractSessionToken, resetDatabase } from './helpers.js';

const REGISTER_URL = '/api/v1/auth/register';
const ME_URL = '/api/v1/auth/me';
const COOKIE_NAME = 'excellent_wealth_session';

describe('GET /api/v1/auth/me', () => {
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
        email: 'me.user@example.com',
        password: 'Str0ngPassphrase',
        confirmPassword: 'Str0ngPassphrase',
        displayName: 'Me User',
      },
    });
    const token = extractSessionToken(response.headers['set-cookie'], COOKIE_NAME);
    if (!token) throw new Error('expected a session cookie in the register response');
    return token;
  }

  it('returns the current user for a valid session', async () => {
    const token = await registerAndGetToken();
    const response = await app.inject({
      method: 'GET',
      url: ME_URL,
      cookies: { [COOKIE_NAME]: token },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().data.user.email).toBe('me.user@example.com');
  });

  it('never includes the password hash', async () => {
    const token = await registerAndGetToken();
    const response = await app.inject({
      method: 'GET',
      url: ME_URL,
      cookies: { [COOKIE_NAME]: token },
    });
    expect(JSON.stringify(response.json())).not.toMatch(/argon2/);
  });

  it('returns 401 when no cookie is present', async () => {
    const response = await app.inject({ method: 'GET', url: ME_URL });
    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe('AUTH_REQUIRED');
  });

  it('returns 401 for an invalid/unknown token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: ME_URL,
      cookies: { [COOKIE_NAME]: 'not-a-real-token' },
    });
    expect(response.statusCode).toBe(401);
  });

  it('returns 401 for an expired session', async () => {
    const token = await registerAndGetToken();
    await prisma.session.updateMany({ data: { expiresAt: new Date(Date.now() - 1000) } });

    const response = await app.inject({
      method: 'GET',
      url: ME_URL,
      cookies: { [COOKIE_NAME]: token },
    });
    expect(response.statusCode).toBe(401);
  });

  it('returns 401 for a revoked session', async () => {
    const token = await registerAndGetToken();
    await prisma.session.updateMany({ data: { revokedAt: new Date() } });

    const response = await app.inject({
      method: 'GET',
      url: ME_URL,
      cookies: { [COOKIE_NAME]: token },
    });
    expect(response.statusCode).toBe(401);
  });

  it('returns 401 for a disabled user account', async () => {
    const token = await registerAndGetToken();
    await prisma.user.updateMany({ data: { status: 'DISABLED' } });

    const response = await app.inject({
      method: 'GET',
      url: ME_URL,
      cookies: { [COOKIE_NAME]: token },
    });
    expect(response.statusCode).toBe(401);
  });
});
