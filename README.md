<!-- Project logo placeholder: docs/architecture/assets/logo.svg (not yet added) -->

# Excellent Wealth

**Financial clarity, explained.** An open-source, privacy-first platform for
personal wealth management, business finance, and investment analysis —
where every calculation shows its work.

> **Educational and analytical tool.** Excellent Wealth provides educational
> and analytical information only. It does not provide personalised
> regulated financial advice, and no projection, simulation, or score it
> displays is a guarantee of future financial results.

## Mission

Help people and small-business owners understand and improve their financial
position — net worth, budgets, savings goals, debt payoff, investment
allocation — using transparent, auditable formulas instead of black-box
recommendations, with privacy-first local data handling wherever possible.

## Screenshots

_Coming soon — the landing page currently ships in `apps/web`; run it locally
with the instructions below to preview it._

## Key features (in development)

- Net worth, asset, and liability tracking
- Budgeting (monthly, category, zero-based) with variance analysis
- Debt payoff planning (snowball / avalanche) with amortisation detail
- Compound-growth and what-if financial simulation
- Emergency-fund gap analysis
- Explainable, rules-based financial health score
- Business revenue/expense tracking and cash-flow dashboards
- Privacy-first local demo mode — try it before creating an account
- Accessible, responsive design throughout

See [ROADMAP.md](ROADMAP.md) for the full milestone plan and
[docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md) for what's implemented today.

## Architecture overview

A TypeScript pnpm monorepo: a Next.js frontend (`apps/web`), a Fastify +
Prisma + PostgreSQL API (`apps/api`), and shared packages for domain types,
validation, a decimal-safe financial calculation engine, and a design
system. See [docs/architecture/overview.md](docs/architecture/overview.md)
and [docs/decisions](docs/decisions) for the reasoning behind these choices.

```text
apps/web                  Next.js frontend
apps/api                  Fastify + Prisma API — authentication implemented (Version 0.2)
packages/types             Shared domain types
packages/validation          Shared Zod validation schemas
packages/financial-engine     Decimal-safe financial formulas + unit tests
packages/ui                    Shared accessible React components
packages/analytics               Explainable insight engine (planned)
```

## Technology stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Node.js, TypeScript, Fastify, PostgreSQL, Prisma, Zod, Argon2id
- **Testing:** Vitest, React Testing Library, Playwright (planned)
- **Tooling:** pnpm workspaces, ESLint, Prettier, Husky, lint-staged,
  commitlint, GitHub Actions, Dependabot

## Local setup

Requires Node.js 20+, pnpm, and a PostgreSQL instance (see
[docs/development/database-setup.md](docs/development/database-setup.md) —
Docker Compose is the quickest path).

```bash
git clone https://github.com/kapilashkapilash2025-netizen/excellent-wealth.git
cd excellent-wealth
pnpm install
```

### Environment configuration

```bash
cp .env.example apps/api/.env
# edit apps/api/.env with local values — never commit this file
```

### Run the web app

```bash
pnpm --filter @excellent-wealth/web dev
```

### Run the API

```bash
docker compose up -d postgres
pnpm --filter @excellent-wealth/api prisma:migrate
pnpm --filter @excellent-wealth/api dev
```

See [docs/development/api-setup.md](docs/development/api-setup.md) and
[docs/api/authentication.md](docs/api/authentication.md) for endpoint
details and troubleshooting.

## Test commands

```bash
pnpm test         # run all workspace unit/component tests (no database required)
pnpm typecheck    # TypeScript project-wide type checking
pnpm lint         # ESLint across the monorepo
pnpm --filter @excellent-wealth/api test:integration   # requires PostgreSQL — see docs/development/api-setup.md
pnpm --filter @excellent-wealth/api test:security        # requires PostgreSQL
```

## Build commands

```bash
pnpm build        # build all workspace packages/apps
```

## Contributing

See [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) for branching,
commit conventions, and pull-request expectations, and the
[Code of Conduct](CODE_OF_CONDUCT.md).

## Security

See [SECURITY.md](.github/SECURITY.md) for how to report vulnerabilities, and
[docs/security](docs/security) for the current threat model and security
checklist. Never commit `.env` files, credentials, or access tokens.

## Financial disclaimer

Excellent Wealth is an educational and analytical tool. It does not provide
regulated financial, investment, tax, or legal advice, does not guarantee any
financial return, and is not a substitute for advice from a licensed
professional. Simulations and projections (e.g. compound growth, debt
payoff) are illustrative estimates based on the inputs you provide, not
predictions of actual future performance.

## Roadmap

See [ROADMAP.md](ROADMAP.md).

## License

[MIT](LICENSE)

## Creator credit

```text
Created by Kapilash
Founder and CEO, AXSONprime
Project: Excellent Wealth
```
