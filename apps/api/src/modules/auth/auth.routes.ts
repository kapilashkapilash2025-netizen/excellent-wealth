import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/authenticate.js';
import { AUTH_RATE_LIMIT_CONFIG } from '../../middleware/rate-limit.js';
import { login, logout, me, register } from './auth.controller.js';

export async function registerAuthRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/v1/auth/register', { config: AUTH_RATE_LIMIT_CONFIG }, register);
  app.post('/api/v1/auth/login', { config: AUTH_RATE_LIMIT_CONFIG }, login);
  app.post('/api/v1/auth/logout', logout);
  app.get('/api/v1/auth/me', { preHandler: authenticate }, me);
}
