# Commit Roadmap

This document estimates the scale of meaningful work across the long-term
roadmap. It is a planning aid, **not** a target — commits are never created
artificially to approach these numbers. See [ROADMAP.md](../ROADMAP.md) for
the underlying milestones and section 17 of the project's development
guidelines for the session commit-rate policy (roughly 5–20 genuine commits
per working session, more only when independently justified).

| Milestone                         | Rough work-unit estimate | Basis                                                                                        |
| --------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------- |
| 0.1 Repository foundation         | 15–25 commits            | scaffold, tooling, docs, financial engine, landing page, CI (this session covers most of it) |
| 0.2 Authentication foundation     | 20–35 commits            | schema, migrations, registration/login/logout, sessions, rate limiting, tests                |
| 0.3 Transactions                  | 25–40 commits            | CRUD, search/filter, recurring, split, import/export, dedup, tests                           |
| 0.4 Budgeting                     | 20–30 commits            | budgets, templates, variance analysis, alerts, rollover, forecasting                         |
| 0.5 Assets & liabilities          | 15–25 commits            | entity CRUD across classes, net-worth dashboard/history                                      |
| 0.6 Goals & debt planner          | 20–30 commits            | goals, contribution schedules, snowball/avalanche, amortisation, simulator                   |
| 0.7 Investment & business finance | 25–40 commits            | portfolio analytics, business revenue/expense/invoices/cash-flow                             |
| 0.8 Explainable intelligence      | 15–25 commits            | insight engine, health score UI, per-insight tests                                           |
| 0.9 Reporting & hardening         | 20–30 commits            | report suite, a11y audit fixes, perf work, security hardening                                |
| 1.0 Production readiness          | 10–15 commits            | final docs, stable API surface, deployment templates, release notes                          |

Totals across the full roadmap plausibly land somewhere in the hundreds,
consistent with the project's expectation of a rich, traceable history built
up over many sessions — never inflated by empty, whitespace-only, or
artificially split commits.
