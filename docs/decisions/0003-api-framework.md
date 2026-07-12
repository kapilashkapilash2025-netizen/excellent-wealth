# ADR 0003: Fastify as the API Framework

## Status

Accepted — 2026-07-12

## Context

Version 0.2 needed a Node.js/TypeScript HTTP framework for `apps/api` to
implement authentication, sessions, and (over time) the rest of the
financial data endpoints. The two realistic candidates were Express and
Fastify. Requirements driving the choice:

- First-class async/await request handlers (no callback-style middleware).
- A plugin ecosystem covering secure headers, CORS, cookies, and rate
  limiting without hand-rolling each one.
- A test story that doesn't require booting a real TCP listener per test.
- Reasonable TypeScript ergonomics without a large custom typing layer.

## Decision

Use **Fastify** (`fastify@^5`), with its first-party plugins
`@fastify/helmet`, `@fastify/cors`, `@fastify/cookie`, and
`@fastify/rate-limit`.

Reasoning:

- **Native async handlers.** Every route/hook in this codebase (`auth.controller.ts`,
  `authenticate.ts`, etc.) is `async` and either returns/sends a value or
  throws — Fastify's model matches this directly. Express 4's middleware
  model requires wrapping every async handler to forward rejected promises
  to `next()`, or upgrading to Express 5 (still less mature as of this
  writing).
- **`app.inject()` for tests.** Fastify (via `light-my-request`) can dispatch
  a fully-routed request against an app instance without binding a real
  port. This is what every test in `apps/api/tests/integration` and
  `apps/api/tests/security` uses — no `supertest` dependency needed, and no
  network flakiness in CI.
- **First-party security plugins.** `@fastify/helmet`, `@fastify/cors`,
  `@fastify/rate-limit`, and `@fastify/cookie` are maintained by the Fastify
  org, version-matched to core, and typed. Express requires assembling
  `helmet`, `cors`, `cookie-parser`, and a separate rate-limiter from
  unrelated maintainers.
- **Centralised error handling built in.** `setErrorHandler` /
  `setNotFoundHandler` give one place to map every thrown error (typed
  `AppError` subclasses or otherwise) to the project's standard response
  envelope (`src/middleware/error-handler.ts`) — see
  [ADR 0002](0002-decimal-safe-money.md)'s sibling convention of "one place
  owns this concern."
- **Structured logging built in.** Fastify embeds Pino as its logger
  (`src/config/logger.ts`), with per-request child loggers and a `redact`
  option used to keep passwords and tokens out of log output — no separate
  logging library to wire up.

## Consequences

- Route handlers, hooks, and plugins in `apps/api` use Fastify's API
  (`fastify.get(...)`, `preHandler`, `onRequest`, plugin `register`) rather
  than Express middleware conventions — anyone touching this code should
  read Fastify's hook lifecycle docs, not Express's.
- A quirk this project hit directly: `@fastify/rate-limit`'s
  `errorResponseBuilder` return value is `throw`n internally by the plugin,
  not sent directly — so it must return something with a `.statusCode`
  (this project passes a `RateLimitError` instance) or the central error
  handler will misclassify it as an unexpected 500. See
  `src/middleware/rate-limit.ts` and the regression test in
  `tests/integration/login.test.ts`.
- Fastify's `genReqId` option receives the raw Node `IncomingMessage`, not a
  `FastifyRequest` — the wrapper doesn't exist yet at that point in the
  request lifecycle (see `src/middleware/request-id.ts`).
