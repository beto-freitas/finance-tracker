# Project layout

Canonical map of shared modules under `src/lib/`, `src/db/`, and dev tools. ADRs link here instead of duplicating full path lists.

**Before importing from `src/lib/`**, check this file. Stale paths in older snippets are wrong.

## `src/lib/` — shared infrastructure

| Path | Purpose |
|------|---------|
| `lib/auth/auth-server.ts` | Better Auth server instance (`authServer`) — server-only |
| `lib/auth/auth-client.ts` | Better Auth client (`authClient`) — browser |
| `lib/currency/currencies.ts` | `SUPPORTED_CURRENCIES`, `CurrencyCode`, labels |
| `lib/currency/minor-units.ts` | `toMinorUnits`, `fromMinorUnits` — **only** place for `×100` / `÷100` (see [feature-end-to-end](./feature-end-to-end.md#persistence-conventions)) |
| `lib/currency/format-currency.ts` | Display formatting — takes **major** units |
| `lib/date/iso-date.ts` | `toIsoDate`, `todayIsoDate` — calendar date helpers |
| `lib/db/utils.ts` | `idColumn`, `timestampsColumns`, … — see [ADR-0004](../adr/0004-database-schema-layout.md) |
| `lib/env/env-server.ts` | Zod-validated server env (`TURSO_*`, …) — server-only |
| `lib/env/env-client.ts` | Zod-validated client env (`BETTER_AUTH_URL`, …) |
| `lib/errors/app-error.ts` | Base expected-failure error |
| `lib/errors/app-unauthenticated-error.ts` | 401 for missing session (middleware) |
| `lib/form/` | TanStack Form hook, field wrapper, display helpers |
| `lib/hooks/use-auth.ts` | Session subscription hook |
| `lib/query/query.ts` | Query client factory |
| `lib/query/app-query-fn.ts` | Query envelope unwrap + toast |
| `lib/query/app-mutation-fn.ts` | Mutation envelope unwrap + toast |
| `lib/query/invalidate-on-success.ts` | `invalidateOnSuccess` helper |
| `lib/server-fn/auth-middleware.ts` | `authMiddleware` for protected serverFns |
| `lib/server-fn/create-success-response.ts` | Success envelope |
| `lib/server-fn/response-data.ts` | `AppServerFnResult` type helper |
| `lib/server-fn/http-status.ts` | HTTP status constants |
| `lib/utils.ts` | `cn()` and project-wide `Icon` type alias |

### Moved paths (do not use)

| Old | New |
|-----|-----|
| `#/lib/auth.ts` | `#/lib/auth/auth-server.ts` |
| `#/lib/auth-client.ts` | `#/lib/auth/auth-client.ts` |
| `#/lib/currency.ts` | `#/lib/currency/currencies.ts` |
| `#/lib/http-status.ts` | `#/lib/server-fn/http-status.ts` |
| `#/lib/query.ts` | `#/lib/query/query.ts` |
| `src/types/icon.ts` | `Icon` type in `#/lib/utils.ts` |

## `src/db/` — database

See [ADR-0004](../adr/0004-database-schema-layout.md).

| Path | Purpose |
|------|---------|
| `db/index.ts` | Drizzle v1 client |
| `db/schemas/` | One table per file + barrel |
| `db/relations.ts` | `defineRelations` |
| `lib/db/utils.ts` | Shared column helpers |

## `src/features/` — feature modules

Each feature owns queries, mutations, schemas, and optional `lib/` helpers. See [ADR-0003](../adr/0003-server-functions-and-data-fetching.md) and [`feature-end-to-end.md`](./feature-end-to-end.md).

**Live domain reference:** `src/features/cash-accounts/`

## Dev tools

| Path | Purpose | Agent policy |
|------|---------|--------------|
| `tools/clear-db.ts` | Drop all tables + migrations for local dev reset | **Never run** — human dev only |

## Related docs

- [ADR-0001](../adr/0001-form-input-architecture.md) — form input stack
- [ADR-0002](../adr/0002-auth-boundary-and-route-guards.md) — auth boundary
- [ADR-0003](../adr/0003-server-functions-and-data-fetching.md) — serverFns + data fetching
- [ADR-0004](../adr/0004-database-schema-layout.md) — database schema layout
