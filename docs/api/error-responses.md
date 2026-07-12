# API Response Format

## Success envelope

Every successful response (2xx) has this shape:

```json
{
  "success": true,
  "data": {}
}
```

`data` holds the endpoint-specific payload — see
[docs/api/authentication.md](authentication.md) for concrete examples.

`GET /health` and `GET /ready` are the one exception: they're infrastructure
probe endpoints, not client-facing API responses, and intentionally return
a bare `{ "status": "ok" }` / `{ "status": "ready" }` shape instead of the
envelope above, so they stay dependency-free and answer even when other
parts of the app are unhealthy.

## Error envelope

Every error response has this shape:

```json
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Unable to authenticate with the provided credentials.",
    "requestId": "a1b2c3d4-..."
  }
}
```

`requestId` matches the `X-Request-Id` the client sent (if it looked like a
valid ID) or a freshly generated one — the same ID Fastify's request logs
use, so a client-reported error can be correlated to a server log line.

## Error codes

| Code                       | HTTP status | Meaning                                                                                                                                           |
| -------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VALIDATION_ERROR`         | 400         | The request body failed schema validation (missing/invalid/unknown fields).                                                                       |
| `BAD_REQUEST`              | 400         | The request could not be parsed at all (e.g. malformed JSON).                                                                                     |
| `AUTH_INVALID_CREDENTIALS` | 401         | Login failed — deliberately identical for "wrong password", "unknown email", and "account locked".                                                |
| `AUTH_REQUIRED`            | 401         | The endpoint requires authentication and no valid session was found.                                                                              |
| `FORBIDDEN`                | 403         | The authenticated user isn't allowed to perform this action. Not yet used by any Version 0.2 endpoint — reserved for future authorization checks. |
| `CONFLICT`                 | 409         | E.g. registering with an email already in use.                                                                                                    |
| `RATE_LIMITED`             | 429         | Too many requests — see [docs/api/authentication.md#rate-limiting](authentication.md#rate-limiting).                                              |
| `NOT_FOUND`                | 404         | Unknown route, or (in the future) a resource that doesn't exist.                                                                                  |
| `PAYLOAD_TOO_LARGE`        | 413         | Request body exceeded the 100 KiB limit.                                                                                                          |
| `INTERNAL_ERROR`           | 500         | An unexpected server error. The response never includes the real error message or a stack trace — see below.                                      |

## What errors never contain

- A stack trace, in any environment.
- The underlying database/Prisma error message.
- Whether a specific email address has an account (for login failures).
- Any field submitted in the request body (in particular, never an echoed
  password).

Unexpected errors are logged server-side in full (via Fastify's Pino
logger, with password/token fields redacted — see
[docs/api/authentication.md](authentication.md)) so they're debuggable from
logs even though the client only ever sees the generic `INTERNAL_ERROR`
message.

## Typed error classes

Every thrown error in `apps/api` is one of the classes in
`src/shared/errors.ts` (`ValidationError`, `AuthenticationError`,
`UnauthenticatedError`, `AuthorizationError`, `ConflictError`,
`RateLimitError`, `NotFoundError`, `InternalError`), each carrying its own
stable `code` and `statusCode`. The central error handler
(`src/middleware/error-handler.ts`) is the only place that turns a thrown
error into an HTTP response — route/controller code never calls
`reply.send()` directly for an error path.
