import type { FastifyInstance } from 'fastify';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '../../src/database/prisma.js';
import { createTestApp, resetDatabase } from './helpers.js';

describe('GET /health', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    await resetDatabase();
    app = await createTestApp();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('returns ok without touching the database', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });
});

describe('GET /ready', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    await resetDatabase();
    app = await createTestApp();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('returns ready when the database is reachable', async () => {
    const response = await app.inject({ method: 'GET', url: '/ready' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ready' });
  });

  it('never includes database credentials or connection detail in the response', async () => {
    const response = await app.inject({ method: 'GET', url: '/ready' });
    expect(JSON.stringify(response.json())).not.toMatch(/postgres|password|@localhost/i);
  });
});
