import type { FastifyReply } from 'fastify';

export interface SuccessBody<T> {
  success: true;
  data: T;
}

export interface ErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    requestId: string;
  };
}

/** Sends the project's standard success envelope: { success: true, data }. */
export function sendSuccess<T>(reply: FastifyReply, data: T, statusCode = 200): FastifyReply {
  const body: SuccessBody<T> = { success: true, data };
  return reply.status(statusCode).send(body);
}

/** Builds the project's standard error envelope: { success: false, error }. */
export function buildErrorBody(code: string, message: string, requestId: string): ErrorBody {
  return { success: false, error: { code, message, requestId } };
}
