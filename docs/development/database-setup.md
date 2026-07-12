# Database Setup (Local Development)

`apps/api` uses PostgreSQL via Prisma. You need a running Postgres instance
before `apps/api` will start or its integration/security tests will pass.

## Option A: Docker Compose (recommended)

```bash
docker compose up -d postgres
```

This starts Postgres 16 on `localhost:5432` with user/password `postgres`/`postgres`
and a default database named `excellent_wealth` (see
[docker-compose.yml](../../docker-compose.yml)). The integration/security
test suites use a separate `excellent_wealth_test` database — create it once:

```bash
docker compose exec postgres psql -U postgres -c "CREATE DATABASE excellent_wealth_test;"
```

## Option B: A local PostgreSQL install

Any local PostgreSQL 14+ works. Create the two databases:

```bash
createdb excellent_wealth
createdb excellent_wealth_test
```

## Configure `DATABASE_URL`

```bash
cp .env.example apps/api/.env
# edit apps/api/.env — set DATABASE_URL to match your setup, e.g.:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/excellent_wealth?schema=public
```

`apps/api/.env` is gitignored — never commit it. `apps/api/.env.test`
**is** committed (it contains only fixed, non-secret test defaults matching
the Docker Compose service) and is used automatically as a fallback when
running tests without your own `apps/api/.env` present.

## Run migrations

```bash
pnpm --filter @excellent-wealth/api prisma:migrate        # applies + creates new migrations (dev)
pnpm --filter @excellent-wealth/api prisma:migrate:deploy # applies existing migrations only (CI/prod)
pnpm --filter @excellent-wealth/api prisma:validate       # schema syntax/consistency check, no DB needed
```

Apply the same migrations to the test database before running integration
tests:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/excellent_wealth_test?schema=public" \
  pnpm --filter @excellent-wealth/api prisma:migrate:deploy
```

## Troubleshooting

**PostgreSQL not running** — `prisma migrate` / the API fails to start with
a connection-refused error. Check `docker compose ps` (or `pg_isready` for a
local install) and start it if it's down.

**Invalid `DATABASE_URL`** — the API fails fast at startup with
`Invalid environment configuration: ... DATABASE_URL must be a postgresql://
connection string` (see `src/config/env.ts`). Check the scheme, credentials,
host, port, and database name.

**Prisma client not generated** — errors mentioning
`@prisma/client did not initialize yet` mean `prisma generate` hasn't run.
It runs automatically via `postinstall` on `pnpm install`; run it manually
with `pnpm --filter @excellent-wealth/api prisma:generate` if needed.

**Migration failure** — read the Prisma error output first; it usually
names the exact SQL statement that failed. A common cause locally is a
half-applied previous migration — check `_prisma_migrations` in the target
database, and consider resetting a _local-only_ database with
`prisma migrate reset` (never run this against a database with real data).

**Port already in use** — if `5432` is already bound (e.g. another local
Postgres), either stop that process or change the mapped port in
`docker-compose.yml` and update `DATABASE_URL` to match.

**Missing environment variables** — the API validates `DATABASE_URL`,
`WEB_ORIGIN`, and `SESSION_SECRET` at startup and refuses to boot with a
clear, secret-free error naming exactly which variable is missing or
invalid (`src/config/env.ts`).
