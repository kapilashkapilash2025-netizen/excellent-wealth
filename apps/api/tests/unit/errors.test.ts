import { describe, expect, it } from 'vitest';
import {
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  InternalError,
  NotFoundError,
  RateLimitError,
  UnauthenticatedError,
  ValidationError,
  isAppError,
} from '../../src/shared/errors.js';

describe('typed error classes', () => {
  it('each carries a stable code and the expected HTTP status', () => {
    expect(new ValidationError()).toMatchObject({ code: 'VALIDATION_ERROR', statusCode: 400 });
    expect(new AuthenticationError()).toMatchObject({
      code: 'AUTH_INVALID_CREDENTIALS',
      statusCode: 401,
    });
    expect(new UnauthenticatedError()).toMatchObject({ code: 'AUTH_REQUIRED', statusCode: 401 });
    expect(new AuthorizationError()).toMatchObject({ code: 'FORBIDDEN', statusCode: 403 });
    expect(new ConflictError()).toMatchObject({ code: 'CONFLICT', statusCode: 409 });
    expect(new RateLimitError()).toMatchObject({ code: 'RATE_LIMITED', statusCode: 429 });
    expect(new NotFoundError()).toMatchObject({ code: 'NOT_FOUND', statusCode: 404 });
    expect(new InternalError()).toMatchObject({ code: 'INTERNAL_ERROR', statusCode: 500 });
  });

  it('isAppError distinguishes typed errors from plain errors', () => {
    expect(isAppError(new ValidationError())).toBe(true);
    expect(isAppError(new Error('plain'))).toBe(false);
    expect(isAppError('not an error')).toBe(false);
  });

  it('uses safe default messages that do not echo internal detail', () => {
    const error = new AuthenticationError();
    expect(error.message).not.toMatch(/database|sql|prisma/i);
  });
});
