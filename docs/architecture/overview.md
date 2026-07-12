# Architecture Overview

## Monorepo layout

```text
apps/web                 Next.js frontend (landing page today; full app UI over time)
apps/api                 Fastify + Prisma REST API — authentication implemented (Version 0.2)
apps/docs                Documentation site (planned)
packages/types            Shared domain types (Money, Asset, Liability, Transaction, ...)
packages/validation        Shared Zod schemas used by forms and by apps/api's request bodies
packages/financial-engine   Decimal-safe financial formulas, pure functions, fully unit-tested
packages/ui                 Shared accessible React components (design system)
packages/analytics          Explainable insight engine (planned, Version 0.8)
packages/config              Shared TypeScript/ESLint configuration
database/                    Pointers to apps/api/prisma (migrations/schema live there — Prisma's convention)
```

`apps/api` is itself organised into `config/` (env validation, logging),
`database/` (Prisma client singleton), `modules/{auth,users,health}/`
(routes → controllers → services → repositories), `middleware/`
(authentication, error handling, rate limiting, request IDs), `security/`
(password hashing, session tokens, audit events), and `shared/` (typed
errors, response envelope). See
[docs/api/authentication.md](../api/authentication.md) for the endpoint
reference and [ADR 0003](../decisions/0003-api-framework.md) /
[ADR 0004](../decisions/0004-server-side-sessions.md) for the framework and
session-design rationale.

## Design principles

- **Formulas are pure and shared.** Everything in `packages/financial-engine`
  is a pure function operating on plain data (`Money`, `Asset`, etc.) with no
  I/O, so the same tested calculation runs identically in the browser, on the
  server, and in tests.
- **Validation at the boundary, once.** `packages/validation`'s Zod schemas
  are the single source of truth for "is this input acceptable" — used by
  forms in `apps/web` and, as of Version 0.2, by `apps/api`'s registration
  and login endpoints directly (`apps/api/src/modules/auth/auth.schemas.ts`
  re-exports them rather than redefining server-side rules).
- **No silent currency mixing.** Every function that combines `Money` values
  requires matching currencies and throws `CurrencyMismatchError` otherwise
  (see [ADR 0002](../decisions/0002-decimal-safe-money.md)).
- **Educational, not advisory.** Every user-facing calculation or insight is
  paired with an explanation and a disclaimer (`packages/ui`'s `Disclaimer`
  component) rather than presented as a bare number or a recommendation.

## Authenticated request flow

See [docs/security/data-flow.md](../security/data-flow.md) for the full
authenticated data-flow diagram, now implemented as of Version 0.2.
