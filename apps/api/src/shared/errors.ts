/**
 * Typed application errors. Each carries a stable `code` (used by clients to
 * branch on error type) and an HTTP `statusCode`. Messages must always be
 * safe to return to the client — never interpolate raw database errors,
 * stack traces, or other internal detail into `message`.
 */
export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
  readonly details?: unknown;

  constructor(message = 'The request contains invalid input.', details?: unknown) {
    super(message);
    this.details = details;
  }
}

export class AuthenticationError extends AppError {
  readonly code = 'AUTH_INVALID_CREDENTIALS';
  readonly statusCode = 401;

  constructor(message = 'Unable to authenticate with the provided credentials.') {
    super(message);
  }
}

export class UnauthenticatedError extends AppError {
  readonly code = 'AUTH_REQUIRED';
  readonly statusCode = 401;

  constructor(message = 'Authentication is required to access this resource.') {
    super(message);
  }
}

export class AuthorizationError extends AppError {
  readonly code = 'FORBIDDEN';
  readonly statusCode = 403;

  constructor(message = 'You do not have permission to perform this action.') {
    super(message);
  }
}

export class ConflictError extends AppError {
  readonly code = 'CONFLICT';
  readonly statusCode = 409;

  constructor(message = 'The request could not be completed due to a conflict.') {
    super(message);
  }
}

export class RateLimitError extends AppError {
  readonly code = 'RATE_LIMITED';
  readonly statusCode = 429;

  constructor(message = 'Too many requests. Please try again later.') {
    super(message);
  }
}

export class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;

  constructor(message = 'The requested resource was not found.') {
    super(message);
  }
}

export class InternalError extends AppError {
  readonly code = 'INTERNAL_ERROR';
  readonly statusCode = 500;

  constructor(message = 'An unexpected error occurred. Please try again later.') {
    super(message);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
