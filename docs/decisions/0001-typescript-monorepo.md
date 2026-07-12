# ADR 0001: TypeScript pnpm Monorepo

## Status

Accepted — 2026-07-12

## Context

Excellent Wealth spans a web frontend, a future API, and several shared
domain packages (financial formulas, validation, types, UI components) that
must stay in lock-step. We need a structure that lets these evolve together
with shared tooling, without duplicating type definitions or business logic
between the frontend and backend.

## Decision

Use a single pnpm workspace monorepo (`apps/*`, `packages/*`) with strict
TypeScript throughout. Shared configuration (`tsconfig`, ESLint) lives in
`packages/config` and is extended by every workspace package. Business logic
that must be identical on client and server (money arithmetic, compound
growth, net worth, validation schemas) lives in dependency-free packages
(`packages/financial-engine`, `packages/validation`, `packages/types`) that
both `apps/web` and the future `apps/api` import directly, rather than being
duplicated or exposed only over HTTP.

## Consequences

- A single `pnpm install` and a small set of root scripts (`lint`,
  `typecheck`, `test`, `build`) operate across the whole project.
- Financial formulas are unit-tested once, in one place, and reused
  everywhere — reducing the risk of client/server calculation drift.
- Workspace packages currently reference each other's TypeScript sources
  directly (via `workspace:*` and `exports` pointing at `src`) rather than
  requiring a build step per package before consumption, which keeps local
  development fast at this project size. This will be revisited if/when
  packages need to be published or consumed outside the monorepo.
- pnpm was chosen over npm/yarn workspaces for its stricter dependency
  isolation (no phantom dependencies) and faster installs via a content-
  addressable store.
