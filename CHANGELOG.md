# Changelog

All notable changes to Excellent Wealth are documented here. Format loosely
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions
correspond to the milestones in [ROADMAP.md](ROADMAP.md).

## [Unreleased] — Version 0.1: Repository foundation

### Added

- Monorepo scaffold: `apps/web`, `apps/api` (placeholder), `apps/docs`
  (placeholder), `packages/{types,validation,financial-engine,ui,analytics,config}`,
  `database/*`, `tests/*`, `docs/*`.
- Shared TypeScript configuration (`packages/config`) and ESLint flat config.
- `@excellent-wealth/types`: `Money`, `CurrencyCode`, and core domain entity
  types (Asset, Liability, Transaction, FinancialGoal).
- `@excellent-wealth/financial-engine`: decimal-safe money arithmetic, net
  worth, savings rate, debt-to-income ratio, compound growth projection,
  emergency fund assessment, and an explainable financial health score — each
  with unit tests covering zero, negative, large, and currency-mismatch cases.
- `@excellent-wealth/validation`: Zod schemas for currency/money, transactions,
  registration, and login, with unit tests.
- `@excellent-wealth/ui`: accessible `Button`, `Card`, and `Disclaimer`
  components with component tests.
- `apps/web`: responsive, accessible landing page (Next.js + Tailwind) with
  the Excellent Wealth brand palette (dark navy, neon-blue accent, restrained
  maroon), skip-to-content link, and reduced-motion support.
- Governance and security documentation: `SECURITY.md`, threat model,
  data-flow overview, security checklist, ADRs 0001–0002.
- Project governance docs: `PROJECT_STATUS.md`, `COMMIT_ROADMAP.md`,
  `FEATURE_MATRIX.md`, `QUALITY_SCORECARD.md`.
