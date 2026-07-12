import type { FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../../config/env.js';
import { clearSessionCookie, setSessionCookie } from '../../security/session.js';
import { UnauthenticatedError, ValidationError } from '../../shared/errors.js';
import { sendSuccess } from '../../shared/responses.js';
import { loginInputSchema, registrationInputSchema } from './auth.schemas.js';
import { loginUser, logoutUser, registerUser } from './auth.service.js';
import type { RequestMetadata } from './auth.types.js';

function buildRequestMetadata(request: FastifyRequest): RequestMetadata {
  const userAgent = request.headers['user-agent'];
  return {
    requestId: request.id,
    ipAddress: request.ip,
    ...(typeof userAgent === 'string' ? { userAgent } : {}),
  };
}

export async function register(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const parsed = registrationInputSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new ValidationError('Registration details are invalid.', parsed.error.flatten());
  }

  const result = await registerUser(parsed.data, buildRequestMetadata(request));
  setSessionCookie(reply, result.rawSessionToken);
  sendSuccess(reply, { user: result.user }, 201);
}

export async function login(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const parsed = loginInputSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new ValidationError('Login details are invalid.', parsed.error.flatten());
  }

  const result = await loginUser(parsed.data, buildRequestMetadata(request));
  setSessionCookie(reply, result.rawSessionToken);
  sendSuccess(reply, { user: result.user });
}

export async function logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const rawToken = request.cookies[env.SESSION_COOKIE_NAME];
  await logoutUser(rawToken, buildRequestMetadata(request));
  clearSessionCookie(reply);
  sendSuccess(reply, { loggedOut: true });
}

export async function me(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (!request.user) {
    // Should be unreachable when the `authenticate` preHandler is wired on
    // this route, but fail closed rather than trust that invariant blindly.
    throw new UnauthenticatedError();
  }
  sendSuccess(reply, { user: request.user });
}
