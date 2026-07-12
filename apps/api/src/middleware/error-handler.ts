import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { isAppError } from '../shared/errors.js';
import { buildErrorBody } from '../shared/responses.js';

/**
 * Maps a Fastify-internal error (malformed JSON, oversized body, schema
 * validation) to a safe, generic message. Never forwards `error.message`
 * for these directly — most are fine, but this keeps the mapping explicit
 * and centrally auditable rather than trusting framework internals.
 */
function mapFrameworkError(error: FastifyError): {
  code: string;
  message: string;
  statusCode: number;
} {
  if (error.code === 'FST_ERR_CTP_BODY_TOO_LARGE') {
    return {
      code: 'PAYLOAD_TOO_LARGE',
      message: 'The request body is too large.',
      statusCode: 413,
    };
  }
  if (error.statusCode === 400) {
    return {
      code: 'BAD_REQUEST',
      message: 'The request could not be understood. Check that the body is valid JSON.',
      statusCode: 400,
    };
  }
  return {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred. Please try again later.',
    statusCode: 500,
  };
}

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    if (isAppError(error)) {
      if (error.statusCode >= 500) {
        request.log.error({ err: error, requestId: request.id }, 'Unhandled application error');
      }
      reply.status(error.statusCode).send(buildErrorBody(error.code, error.message, request.id));
      return;
    }

    const hasKnownStatusCode = typeof error.statusCode === 'number' && error.statusCode < 500;
    if (hasKnownStatusCode) {
      const mapped = mapFrameworkError(error);
      reply.status(mapped.statusCode).send(buildErrorBody(mapped.code, mapped.message, request.id));
      return;
    }

    // Unknown/unexpected error: log full detail server-side, never expose
    // the message or stack trace in the response.
    request.log.error({ err: error, requestId: request.id }, 'Unhandled internal error');
    reply
      .status(500)
      .send(
        buildErrorBody(
          'INTERNAL_ERROR',
          'An unexpected error occurred. Please try again later.',
          request.id,
        ),
      );
  });

  app.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    reply
      .status(404)
      .send(buildErrorBody('NOT_FOUND', 'The requested resource was not found.', request.id));
  });
}
