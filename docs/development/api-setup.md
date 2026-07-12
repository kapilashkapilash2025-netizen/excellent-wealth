# API Setup (Local Development)

## Prerequisites

- Node.js 20+, pnpm (see repository root [README.md](../../README.md))
- A running PostgreSQL instance — see
  [docs/development/database-setup.md](database-setup.md) first.

## First run

```bash
docker compose up -d postgres
pnpm install                                  # also runs `prisma generate` via postinstall
cp .env.example apps/api/.env                 # then edit DATABASE_URL etc.
pnpm --filter @excellent-wealth/api prisma:migrate
pnpm --filter @excellent-wealth/api dev
```

The API listens on `API_PORT` (default `4000`). Verify it's up:

```bash
curl http://localhost:4000/health
curl http://localhost:4000/ready
```

## Everyday commands

```bash
pnpm --filter @excellent-wealth/api dev              # tsx watch — restarts on file changes
pnpm --filter @excellent-wealth/api build             # tsc compile-check (see note below)
pnpm --filter @excellent-wealth/api start              # run the server via tsx (same runtime as dev)
pnpm --filter @excellent-wealth/api typecheck            # tsc --noEmit
pnpm --filter @excellent-wealth/api lint                  # eslint
```

**Note on `build`/`start`**: `apps/api` currently imports workspace packages
(`@excellent-wealth/validation`, etc.) directly from their TypeScript
source, the same way `apps/web` and every `packages/*` test suite does. The
`build` script's `tsc` output under `dist/` is a genuine type-check gate,
but isn't yet a self-contained deployable artifact, since Node's plain ESM
loader can't resolve the sibling packages' `.ts` sources at runtime the way
`tsx` can. `start` therefore runs the server through `tsx` against the
TypeScript source directly (identical runtime behavior to `dev`, without the
watch/reload). Producing a fully self-contained compiled `dist/` for
deployment is deferred to a future milestone — see
[docs/PROJECT_STATUS.md](../PROJECT_STATUS.md).

## Testing

```bash
pnpm --filter @excellent-wealth/api test               # unit tests only — no database needed
pnpm --filter @excellent-wealth/api test:integration     # needs excellent_wealth_test reachable
pnpm --filter @excellent-wealth/api test:security         # mostly DB-backed; a few are pure-logic
pnpm --filter @excellent-wealth/api test:all                # everything above
```

Integration and security tests share one real Postgres database and reset
its tables between test files — they run with `fileParallelism: false`
(`apps/api/vitest.config.ts`) specifically so concurrent test files don't
wipe each other's fixtures mid-assertion. This was a real bug hit during
development; see the comment in that config file.

`DATABASE_URL` for tests falls back to the committed `apps/api/.env.test`
defaults (pointing at `excellent_wealth_test`) whenever it isn't already set
in your shell/CI environment — see
[docs/development/database-setup.md](database-setup.md).

## Troubleshooting

See [docs/development/database-setup.md#troubleshooting](database-setup.md#troubleshooting)
for database-specific issues. API-specific ones:

- **"Invalid environment configuration" at startup** — the error message
  names exactly which variable is missing/invalid; it never prints the
  value of any secret-shaped variable. Check `apps/api/.env` against
  `.env.example`.
- **CORS errors in the browser console** — `WEB_ORIGIN` must exactly match
  the origin `apps/web` is served from (scheme + host + port), including
  for local development (`http://localhost:3000`).
- **`429 Too Many Requests` while testing manually** — the login/register
  rate limit is intentionally strict (10/minute); wait a minute or restart
  the dev server to reset its in-memory limiter state.
