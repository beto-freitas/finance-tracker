# Database schema layout

Drizzle ORM **v1** schema organization: one table per file, shared column helpers, centralized relations, and explicit foreign-key column factories.

**Guide:** import paths and related modules live in [`docs/guides/project-layout.md`](../guides/project-layout.md).

## Context

- Better Auth owns an `account` table — domain tables must not collide on naming or layout.
- Agents and older snippets often assume Drizzle v0 (`sqliteTable` + inline `relations()` on the same file, `drizzle(client, { schema })` without a separate relations object).
- Foreign keys repeated across tables drift on `onDelete` / `onUpdate` policy.

## Decision

### Drizzle v1

This repo uses **Drizzle ORM v1** (`drizzle-orm@1.x`, `drizzle-kit@1.x`):

- `drizzle({ connection, schema, relations })` in [`src/db/index.ts`](../../src/db/index.ts)
- Relations via `defineRelations` in [`src/db/relations.ts`](../../src/db/relations.ts) — **not** inline `relations()` on table files
- Relational query API (`db.query.tableName.findMany({ where: { … } })`) with object `where` syntax

Do not regress to v0 patterns when adding tables or relations.

### File layout

```
src/db/
  index.ts              → drizzle client (connection + schema + relations)
  relations.ts          → defineRelations only
  schemas/
    index.ts            → barrel export
    user-schema.ts      → one table (+ optional FK column factories)
    cash-account-schema.ts
    …
src/lib/db/
  utils.ts              → idColumn, timestampsColumns, …
```

- **One table per file** under `src/db/schemas/{entity}-schema.ts`
- **Barrel export** via `src/db/schemas/index.ts`
- **Relations only** in `src/db/relations.ts`

### Column helpers

Always prefer helpers from [`src/lib/db/utils.ts`](../../src/lib/db/utils.ts) over ad-hoc column definitions:

| Helper | Purpose |
|--------|---------|
| `idColumn()` | Primary key text UUID (`crypto.randomUUID()` default) |
| `createdAtColumn()` | `created_at` timestamp_ms with SQL default |
| `updatedAtColumn()` | `updated_at` timestamp_ms with `$onUpdate` |
| `timestampsColumns()` | `{ createdAt, updatedAt }` spread |

### Foreign keys — `TIdColumn()` on the referenced table

When table **X** has a foreign key to table **Y**, table **Y** exports a column factory; table **X** imports it. Do **not** inline `.references(() => y.id, …)` on table X.

Example — [`user-schema.ts`](../../src/db/schemas/user-schema.ts) exports `userIdColumn()`; [`cash-account-schema.ts`](../../src/db/schemas/cash-account-schema.ts) consumes it:

```ts
// user-schema.ts
export const userIdColumn = (onDelete: s.UpdateDeleteAction = "cascade") =>
  s.text("user_id").notNull().references(() => user.id, { onDelete });

// cash-account-schema.ts
import { userIdColumn } from "./user-schema";

export const cashAccount = s.sqliteTable("cash_account", {
  id: u.idColumn(),
  userId: userIdColumn(),
  …
});
```

- Optional `onDelete` / `onUpdate` only when non-default — **default `onDelete` is `"cascade"`**
- Factory name: `{entity}IdColumn` (e.g. `userIdColumn`, `cashAccountIdColumn` when needed)

### Migrations

- `pnpm db:generate` — generate SQL from schema changes
- `pnpm db:migrate` — apply migrations to Turso

### Dev-only: `tools/clear-db.ts`

[`tools/clear-db.ts`](../../tools/clear-db.ts) drops all application tables and `__drizzle_migrations` for local reset during development.

**Agents must NEVER run this script.** Only the human developer decides when to wipe a dev database.

## Consequences

- New tables follow one predictable layout; FK policy changes happen in one factory.
- Relations stay centralized and compatible with Drizzle v1 relational queries.
- Domain table naming (`cash_account`) stays distinct from Better Auth's `account`.

## Keeping this ADR current

When you change database **architecture** — Drizzle version, schema file layout, relation placement, column helpers, or FK factory conventions — update this ADR in the same PR. If the change affects import paths, update [`docs/guides/project-layout.md`](../guides/project-layout.md) too.
