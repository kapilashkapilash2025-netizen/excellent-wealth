# database/migrations

Prisma migration history actually lives at
[apps/api/prisma/migrations](../../apps/api/prisma/migrations) (Prisma's
required convention: migrations live next to their `schema.prisma`). This
directory is kept as a documentation placeholder pointing there so the
top-level `database/` tree still reflects the project's data layer at a
glance. Each migration is generated with `prisma migrate dev` and reviewed
before being applied to any shared environment — never hand-edited after
being applied. See
[docs/development/database-setup.md](../../docs/development/database-setup.md).
