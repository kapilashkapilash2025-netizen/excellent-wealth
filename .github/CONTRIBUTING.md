# Contributing to Excellent Wealth

Thank you for considering a contribution. This project values traceable,
well-tested, and well-documented changes over raw commit volume.

## Before you start

1. Read [README.md](../README.md), [ROADMAP.md](../ROADMAP.md), and
   [docs/PROJECT_STATUS.md](../docs/PROJECT_STATUS.md) to see what's already
   done and what's next.
2. For anything non-trivial, open an issue first describing the problem or
   feature so the approach can be discussed before code is written.
3. Check [docs/decisions](../docs/decisions) for existing Architecture
   Decision Records (ADRs) relevant to the area you're touching.

## Development setup

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

See [README.md](../README.md) for full local setup instructions, including
environment variables and (once available) the local database.

## Branching and commits

- Branch from `main` using a descriptive name, e.g. `feat/debt-planner`,
  `fix/currency-rounding`, `docs/security-model`.
- Follow [Conventional Commits](https://www.conventionalcommits.org/):
  `feat(scope): summary`, `fix(scope): summary`, `docs(scope): summary`, etc.
  Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`,
  `build`, `ci`, `chore`, `revert`, `security`, `a11y`.
- Each commit should represent one coherent, independently understandable
  change. Prefer several focused commits over one large one — but do not
  split a single change into artificial fragments purely to inflate commit
  count.
- Include tests for behavioral changes and documentation updates for
  architectural changes in the same commit or pull request.

## Pull requests

- Keep pull requests focused on a single feature, fix, or refactor.
- Fill in the pull request template, including a test plan.
- Ensure `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` all pass
  before requesting review.
- Do not include unrelated formatting-only changes in a functional PR.

## Financial calculation contributions

Any code that handles monetary values must:

- Represent money as integer minor units plus a currency code (see
  `packages/types/src/money.ts`), or use `decimal.js` for rate/exponent math —
  never plain floating-point arithmetic for currency.
- Include unit tests covering zero, negative, and very large values, currency
  mismatches, and (where dates are involved) leap years and invalid dates.
- Never present a simulated or projected figure as a guaranteed outcome.

## Security

See [SECURITY.md](../SECURITY.md) for how to report vulnerabilities. Do not
open a public issue for a security vulnerability.

## Code of Conduct

By participating in this project you agree to abide by the
[Code of Conduct](../CODE_OF_CONDUCT.md).
