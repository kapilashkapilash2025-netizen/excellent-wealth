# Architecture Overview

## Monorepo layout

```text
apps/web                 Next.js frontend (landing page today; full app UI over time)
apps/api                 Node.js/TypeScript REST API (planned, Version 0.2)
apps/docs                Documentation site (planned)
packages/types            Shared domain types (Money, Asset, Liability, Transaction, ...)
packages/validation        Shared Zod schemas used by forms and (later) API boundaries
packages/financial-engine   Decimal-safe financial formulas, pure functions, fully unit-tested
packages/ui                 Shared accessible React components (design system)
packages/analytics          Explainable insight engine (planned, Version 0.8)
packages/config              Shared TypeScript/ESLint configuration
database/                    Prisma migrations, seeds, schema references (planned)
```

## Design principles

- **Formulas are pure and shared.** Everything in `packages/financial-engine`
  is a pure function operating on plain data (`Money`, `Asset`, etc.) with no
  I/O, so the same tested calculation runs identically in the browser, on the
  server, and in tests.
- **Validation at the boundary, once.** `packages/validation`'s Zod schemas
  are the single source of truth for "is this input acceptable" — used by
  forms in `apps/web` today and will be reused unchanged by `apps/api`.
- **No silent currency mixing.** Every function that combines `Money` values
  requires matching currencies and throws `CurrencyMismatchError` otherwise
  (see [ADR 0002](../decisions/0002-decimal-safe-money.md)).
- **Educational, not advisory.** Every user-facing calculation or insight is
  paired with an explanation and a disclaimer (`packages/ui`'s `Disclaimer`
  component) rather than presented as a bare number or a recommendation.

## Planned request flow (Version 0.2+)

See [docs/security/data-flow.md](../security/data-flow.md) for the full
authenticated data-flow diagram once `apps/api` exists.
