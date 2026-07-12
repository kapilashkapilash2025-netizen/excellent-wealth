import type { FastifyInstance } from 'fastify';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '../../src/database/prisma.js';
import { createTestApp, resetDatabase } from './helpers.js';

const REGISTER_URL = '/api/v1/auth/register';

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    email: 'new.user@example.com',
    password: 'Str0ngPassphrase',
    confirmPassword: 'Str0ngPassphrase',
    displayName: 'New User',
    ...overrides,
  };
}

describe('POST /api/v1/auth/register', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    await resetDatabase();
    app = await createTestApp();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('registers a new user and returns a safe user object', async () => {
    const response = await app.inject({
      method: 'POST',
      url: REGISTER_URL,
      payload: validPayload(),
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.success).toBe(true);
    expect(body.data.user).toMatchObject({
      email: 'new.user@example.com',
      displayName: 'New User',
      currency: 'USD',
      timezone: 'UTC',
    });
    expect(body.data.user.passwordHash).toBeUndefined();
    expect(body.data.user.id).toEqual(expect.any(String));
  });

  it('sets a secure session cookie', async () => {
    const response = await app.inject({
      method: 'POST',
      url: REGISTER_URL,
      payload: validPayload(),
    });
    const cookie = response.cookies.find((c) => c.name === 'excellent_wealth_session');
    expect(cookie).toBeDefined();
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe('Lax');
    expect(cookie?.value.length).toBeGreaterThan(20);
  });

  it('creates an audit event for successful registration', async () => {
    await app.inject({ method: 'POST', url: REGISTER_URL, payload: validPayload() });
    const events = await prisma.auditEvent.findMany({ where: { eventType: 'USER_REGISTERED' } });
    expect(events).toHaveLength(1);
    expect(events[0]?.outcome).toBe('SUCCESS');
  });

  it('rejects a duplicate email without leaking internal detail', async () => {
    await app.inject({ method: 'POST', url: REGISTER_URL, payload: validPayload() });
    const second = await app.inject({ method: 'POST', url: REGISTER_URL, payload: validPayload() });

    expect(second.statusCode).toBe(409);
    const body = second.json();
    expect(body.success).toBe(false);
    expect(body.error.message).not.toMatch(/prisma|sql|constraint/i);
  });

  it('normalises email casing for uniqueness', async () => {
    await app.inject({
      method: 'POST',
      url: REGISTER_URL,
      payload: validPayload({ email: 'User@Example.com' }),
    });
    const second = await app.inject({
      method: 'POST',
      url: REGISTER_URL,
      payload: validPayload({ email: 'user@example.com' }),
    });
    expect(second.statusCode).toBe(409);
  });

  it('rejects a weak password', async () => {
    const response = await app.inject({
      method: 'POST',
      url: REGISTER_URL,
      payload: validPayload({ password: 'weak', confirmPassword: 'weak' }),
    });
    expect(response.statusCode).toBe(400);
    expect(response.json().success).toBe(false);
  });

  it('rejects an invalid currency code', async () => {
    const response = await app.inject({
      method: 'POST',
      url: REGISTER_URL,
      payload: validPayload({ currency: 'ZZZ' }),
    });
    expect(response.statusCode).toBe(400);
  });

  it('rejects an invalid timezone', async () => {
    const response = await app.inject({
      method: 'POST',
      url: REGISTER_URL,
      payload: validPayload({ timezone: 'Not/AZone' }),
    });
    expect(response.statusCode).toBe(400);
  });

  it('rejects a request missing required fields', async () => {
    const response = await app.inject({
      method: 'POST',
      url: REGISTER_URL,
      payload: { email: 'x@example.com' },
    });
    expect(response.statusCode).toBe(400);
  });

  it('rejects malformed JSON', async () => {
    const response = await app.inject({
      method: 'POST',
      url: REGISTER_URL,
      headers: { 'content-type': 'application/json' },
      payload: '{not-valid-json',
    });
    expect(response.statusCode).toBe(400);
    expect(response.json().success).toBe(false);
  });

  it('rejects unknown top-level fields', async () => {
    const response = await app.inject({
      method: 'POST',
      url: REGISTER_URL,
      payload: validPayload({ isAdmin: true }),
    });
    expect(response.statusCode).toBe(400);
  });

  it('persists the password as an argon2id hash, never the plaintext', async () => {
    await app.inject({ method: 'POST', url: REGISTER_URL, payload: validPayload() });
    const user = await prisma.user.findUnique({
      where: { emailNormalized: 'new.user@example.com' },
    });
    expect(user?.passwordHash).toMatch(/^\$argon2id\$/);
    expect(user?.passwordHash).not.toContain('Str0ngPassphrase');
  });
});
