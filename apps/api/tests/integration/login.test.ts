import type { FastifyInstance } from 'fastify';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '../../src/database/prisma.js';
import { createTestApp, resetDatabase } from './helpers.js';

const REGISTER_URL = '/api/v1/auth/register';
const LOGIN_URL = '/api/v1/auth/login';

const CREDENTIALS = {
  email: 'login.user@example.com',
  password: 'Str0ngPassphrase',
  confirmPassword: 'Str0ngPassphrase',
  displayName: 'Login User',
};

describe('POST /api/v1/auth/login', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    await resetDatabase();
    app = await createTestApp();
    await app.inject({ method: 'POST', url: REGISTER_URL, payload: CREDENTIALS });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('logs in with correct credentials', async () => {
    const response = await app.inject({
      method: 'POST',
      url: LOGIN_URL,
      payload: { email: CREDENTIALS.email, password: CREDENTIALS.password },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().data.user.email).toBe(CREDENTIALS.email);
  });

  it('sets a fresh session cookie distinct from the registration session', async () => {
    const registerResponse = await app.inject({
      method: 'POST',
      url: REGISTER_URL,
      payload: { ...CREDENTIALS, email: 'another@example.com' },
    });
    const loginResponse = await app.inject({
      method: 'POST',
      url: LOGIN_URL,
      payload: { email: 'another@example.com', password: CREDENTIALS.password },
    });
    const registerCookie = registerResponse.cookies.find(
      (c) => c.name === 'excellent_wealth_session',
    );
    const loginCookie = loginResponse.cookies.find((c) => c.name === 'excellent_wealth_session');
    expect(loginCookie?.value).toBeDefined();
    expect(loginCookie?.value).not.toBe(registerCookie?.value);
  });

  it('rejects a wrong password with a generic error', async () => {
    const response = await app.inject({
      method: 'POST',
      url: LOGIN_URL,
      payload: { email: CREDENTIALS.email, password: 'WrongPassphrase1' },
    });
    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe('AUTH_INVALID_CREDENTIALS');
  });

  it('rejects an unknown email with the identical generic error', async () => {
    const response = await app.inject({
      method: 'POST',
      url: LOGIN_URL,
      payload: { email: 'nobody@example.com', password: 'WhateverPassphrase1' },
    });
    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe('AUTH_INVALID_CREDENTIALS');
    expect(response.json().error.message).toBe(
      'Unable to authenticate with the provided credentials.',
    );
  });

  it('tracks failed login attempts', async () => {
    await app.inject({
      method: 'POST',
      url: LOGIN_URL,
      payload: { email: CREDENTIALS.email, password: 'WrongPassphrase1' },
    });
    const user = await prisma.user.findUnique({ where: { emailNormalized: CREDENTIALS.email } });
    expect(user?.failedLoginAttempts).toBe(1);
  });

  it('locks the account after repeated failures and rejects further attempts', async () => {
    for (let i = 0; i < 5; i += 1) {
      await app.inject({
        method: 'POST',
        url: LOGIN_URL,
        payload: { email: CREDENTIALS.email, password: 'WrongPassphrase1' },
      });
    }
    const lockedUser = await prisma.user.findUnique({
      where: { emailNormalized: CREDENTIALS.email },
    });
    expect(lockedUser?.lockedUntil).not.toBeNull();

    // Even the correct password must now fail while locked.
    const response = await app.inject({
      method: 'POST',
      url: LOGIN_URL,
      payload: { email: CREDENTIALS.email, password: CREDENTIALS.password },
    });
    expect(response.statusCode).toBe(401);
  });

  it('resets the failed-attempt counter after a successful login', async () => {
    await app.inject({
      method: 'POST',
      url: LOGIN_URL,
      payload: { email: CREDENTIALS.email, password: 'WrongPassphrase1' },
    });
    await app.inject({
      method: 'POST',
      url: LOGIN_URL,
      payload: { email: CREDENTIALS.email, password: CREDENTIALS.password },
    });
    const user = await prisma.user.findUnique({ where: { emailNormalized: CREDENTIALS.email } });
    expect(user?.failedLoginAttempts).toBe(0);
  });

  it('records lastLoginAt on success', async () => {
    await app.inject({
      method: 'POST',
      url: LOGIN_URL,
      payload: { email: CREDENTIALS.email, password: CREDENTIALS.password },
    });
    const user = await prisma.user.findUnique({ where: { emailNormalized: CREDENTIALS.email } });
    expect(user?.lastLoginAt).not.toBeNull();
  });

  it('records audit events for both success and failure', async () => {
    await app.inject({
      method: 'POST',
      url: LOGIN_URL,
      payload: { email: CREDENTIALS.email, password: 'WrongPassphrase1' },
    });
    await app.inject({
      method: 'POST',
      url: LOGIN_URL,
      payload: { email: CREDENTIALS.email, password: CREDENTIALS.password },
    });
    const events = await prisma.auditEvent.findMany({
      where: { eventType: { in: ['LOGIN_FAILED', 'LOGIN_SUCCEEDED'] } },
      orderBy: { createdAt: 'asc' },
    });
    expect(events.map((e) => e.eventType)).toEqual(['LOGIN_FAILED', 'LOGIN_SUCCEEDED']);
  });

  it('rejects missing password', async () => {
    const response = await app.inject({
      method: 'POST',
      url: LOGIN_URL,
      payload: { email: CREDENTIALS.email },
    });
    expect(response.statusCode).toBe(400);
  });

  it('is rate limited under repeated rapid attempts', async () => {
    const attempts = Array.from({ length: 15 }, () =>
      app.inject({
        method: 'POST',
        url: LOGIN_URL,
        payload: { email: 'rate-limit-probe@example.com', password: 'WhateverPassphrase1' },
      }),
    );
    const responses = await Promise.all(attempts);
    const rateLimited = responses.filter((r) => r.statusCode === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  });
});
