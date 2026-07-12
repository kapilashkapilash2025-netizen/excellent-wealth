# Roadmap

Excellent Wealth is developed in versioned milestones. Each version below
lists its planned scope; see [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md)
for what's actually done right now and [CHANGELOG.md](CHANGELOG.md) for a
dated record of shipped changes.

## Version 0.1 — Repository foundation (complete)

- [x] Monorepo structure (`apps/*`, `packages/*`, `database/*`, `tests/*`, `docs/*`)
- [x] Shared TypeScript/ESLint/Prettier configuration
- [x] Financial engine core formulas with unit tests (net worth, savings
      rate, debt-to-income, compound growth, emergency fund, health score)
- [x] Shared validation schemas (auth, transactions, currency/money)
- [x] Design system foundation (`Button`, `Card`, `Disclaimer`) with component tests
- [x] Responsive, accessible landing page
- [x] Documentation foundation (README, security docs, ADRs, governance docs)
- [x] CI pipeline (lint, typecheck, test, build)

## Version 0.2 — Authentication foundation (complete)

- [x] Database schema and Prisma setup (`apps/api`, PostgreSQL, Docker Compose)
- [x] Registration, login, logout (password-reset architecture deferred — see docs/PROJECT_STATUS.md)
- [x] Currency/timezone captured at registration (theme/accessibility settings deferred to a user-profile milestone)
- [x] Secure session management (opaque, server-side, Argon2id passwords), rate limiting, account lockout, security baseline hardening
- [x] CI extended with a PostgreSQL-backed integration/security test job

## Version 0.3 — Transactions

- Add/edit/delete/categorise transactions, search and filters
- Recurring transactions, split transactions, notes and tags
- CSV import/export, duplicate detection

## Version 0.4 — Budgeting

- Monthly and category budgets, zero-based budgeting, templates
- Actual-vs-planned analysis, overspending alerts, rollover rules, forecasting

## Version 0.5 — Assets and liabilities

- Asset and liability tracking across all supported classes
- Net-worth dashboard and history

## Version 0.6 — Goals and debt planning

- Financial goal planning with contribution schedules and progress tracking
- Debt planner (snowball/avalanche), amortisation tables, scenario simulator

## Version 0.7 — Investment analytics and business finance

- Portfolio allocation, gains/losses, dividends, rebalancing simulation
- Business revenue/expense tracking, invoices, P&L, cash-flow dashboard

## Version 0.8 — Explainable intelligence

- Rules-based insight engine (Module K) with observed data, calculation,
  explanation, confidence/limitations, and disclaimer for every insight
- Financial health score surfaced across the dashboard

## Version 0.9 — Reporting and hardening

- Full report suite (monthly/annual/net-worth/cash-flow/budget/debt/goal/portfolio)
- Accessibility audit, performance optimisation, security hardening

## Version 1.0 — Production readiness

- Production-readiness review, complete documentation, stable APIs,
  deployment templates, release notes

## Beyond 1.0

Continued enhancements, integrations, localisation, privacy improvements,
performance work, and community contributions — scoped and prioritised as
they arise, not pre-committed here.
