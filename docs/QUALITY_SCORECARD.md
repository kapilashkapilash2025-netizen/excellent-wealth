# Quality Scorecard

Last updated: 2026-07-12 (Version 0.1)

| Dimension                  | Status                    | Notes                                                                                                                                                                             |
| -------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Test coverage              | 🚧 Partial                | Unit/component tests exist for `financial-engine`, `validation`, `ui`, and the landing page. No coverage threshold enforced in CI yet.                                            |
| Build status               | ⬜ Pending CI             | Builds pass locally (`pnpm build`); no automated CI run yet — tracked in this milestone.                                                                                          |
| Accessibility              | 🚧 Partial                | Skip-to-content link, semantic landmarks, reduced-motion support, and accessible `Button`/`Disclaimer` components in place. No automated axe-core scan yet (planned Version 0.9). |
| Performance                | ⬜ Not measured           | No production deployment or Lighthouse baseline yet.                                                                                                                              |
| Security                   | 🚧 Partial                | Threat model, data-flow doc, and checklist drafted; most mitigations pending `apps/api` (Version 0.2). No secret-scanning/CodeQL CI yet.                                          |
| Dependency health          | 🚧 Partial                | Dependencies pinned to recent stable versions; Dependabot config pending (this milestone). No audit step in CI yet.                                                               |
| Documentation completeness | ✅ Good for current scope | README, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, ROADMAP, CHANGELOG, ADRs, and status docs all present and current for Version 0.1.                                               |

This scorecard is updated at each milestone boundary and whenever a
dimension's status changes materially.
