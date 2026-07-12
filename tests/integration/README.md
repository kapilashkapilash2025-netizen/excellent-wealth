# tests/integration

`apps/api`'s integration tests actually live at
[apps/api/tests/integration](../../apps/api/tests/integration), next to the
API code they cover — consistent with this monorepo's convention of keeping
tests close to their source (see [tests/unit/README.md](../unit/README.md)).
This directory is reserved for integration tests that span more than one
app/package (e.g. `apps/web` driving `apps/api` end-to-end) — currently
empty.
