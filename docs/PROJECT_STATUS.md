# Project Status

Last updated: 2026-07-12

## Current version

**Version 0.1 — Repository foundation** (in progress)

## Completed modules

- Monorepo scaffold and shared tooling configuration
- `packages/types`: Money and core domain entity types
- `packages/financial-engine`: net worth, savings rate, debt-to-income,
  compound growth, emergency fund, and financial health score formulas —
  fully unit-tested
- `packages/validation`: currency/money, transaction, and auth (registration/
  login) Zod schemas — fully unit-tested
- `packages/ui`: `Button`, `Card`, `Disclaimer` components — component-tested
- `apps/web`: responsive, accessible landing page
- Security docs: threat model, data-flow overview, checklist
- Architecture Decision Records: 0001 (monorepo/stack), 0002 (decimal-safe money)

## Active module

CI pipeline and repository quality gates (GitHub Actions, issue/PR
templates, Dependabot) — remainder of Version 0.1.

## Known issues / limitations

- `apps/api` and the PostgreSQL/Prisma schema do not exist yet — no
  persistence layer, no real authentication yet (validation schemas exist,
  but nothing enforces them server-side).
- `packages/analytics` (explainable insight engine) is scoped but not
  implemented — planned for Version 0.8.
- Playwright end-to-end tests are not set up yet — planned once `apps/web`
  has enough interactive surface (Version 0.2+).
- No CodeQL / dependency-audit CI step yet.

## Test status

- Unit/component tests: passing across `packages/financial-engine`,
  `packages/validation`, `packages/ui`, and `apps/web` (run `pnpm test`).
- Integration, accessibility (page-level), security, and e2e test suites are
  scaffolded (with READMEs explaining scope) but not yet populated.

## Security status

- No known committed secrets; `.env` is gitignored and `.env.example`
  contains no real values.
- Threat model and data-flow docs drafted; most mitigations are marked "not
  implemented yet" pending `apps/api` (see `docs/security/checklist.md`).

## Documentation status

- README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, ROADMAP, CHANGELOG: present.
- Architecture, security, and product docs: present for Version 0.1 scope.
- API documentation: not applicable yet (no API).

## Next recommended tasks

1. Wire up GitHub Actions CI (lint, typecheck, test, build) and Dependabot.
2. Add issue templates, PR template, and CODEOWNERS.
3. Run full quality checks, fix any issues, and make the initial round of
   conventional commits.
4. Create the GitHub repository and push `main`.
5. Begin Version 0.2: database schema design and authentication foundation.
