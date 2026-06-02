# Project layout

Entry-point map for shared code. ADRs link here instead of duplicating full path lists.

**Before importing from `src/lib/`**, check this file. Prefer conventions and grep over expecting every file listed here.

## Top-level tree

```
src/
  components/ui/   shadcn primitives + app chrome (sidebar, spinner, …)
  db/              Drizzle client, schemas, relations — see ADR-0004
  features/        Domain modules (queries, mutations, schemas) — see ADR-0003
  lib/             Cross-cutting infra (auth, query, server-fn, form, …)
  routes/          TanStack Router file routes
tools/             Dev-only scripts (see below)
```

**Conventions:** one concern per `lib/{domain}/` folder; feature file name = export name (`cash-account-list-query-options.ts` → `cashAccountListQueryOptions()`). Do not add every new file to this doc — add a row only when the path or naming is not discoverable from conventions.

### Helper JSDoc

Exported helpers in `lib/**` and `domain/**`:

- One-line JSDoc stating purpose; add `@param` / `@returns` when non-obvious.
- Document invariants (e.g. UTC calendar dates, integer basis points).
- Skip trivial one-liners and test files.

React components and route modules follow the same bar only when the export is a non-obvious pure helper.

## `src/lib/` entry points

| Path | Purpose |
|------|---------|
| `lib/auth/auth-server.ts` / `auth-client.ts` | Better Auth server (`authServer`) and client (`authClient`) |
| `lib/query/query.ts` | Query client factory |
| `lib/query/app-query-fn.ts` / `app-mutation-fn.ts` | Envelope unwrap + toast for queries/mutations |
| `lib/query/invalidate-on-success.ts` | `invalidateOnSuccess` helper |
| `lib/query/query-client-on-success.ts` | `queryClientOnSuccess` — access query client from mutation `onSuccess` args |
| `lib/server-fn/auth-middleware.ts` | `authMiddleware` for protected serverFns |
| `lib/server-fn/create-success-response.ts` | Success envelope |
| `lib/server-fn/response-data.ts` | `AppServerFnResult` type helper |
| `lib/hooks/use-auth.ts` | Session subscription hook |
| `lib/form/` | TanStack Form hook, field wrapper, display helpers |
| `lib/currency/minor-units.ts` | **Only** place for `×100` / `÷100` (see [feature-end-to-end](./feature-end-to-end.md#persistence-conventions)) |
| `lib/currency/currencies.ts` / `currency-columns.ts` | SSOT currency codes; Drizzle enum columns for supported vs FX income currency |
| `lib/sidebar/read-sidebar-open.ts` | Isomorphic cookie read for SSR (`createIsomorphicFn`) |
| `lib/sidebar/sidebar-position-cookie.ts` | Cookie parse + write (7-day expiry) |
| `lib/sidebar/sidebar-items.ts` | Sidebar nav config |
| `lib/env/env-server.ts` / `env-client.ts` | Zod-validated env — server-only / client |
| `lib/errors/app-error.ts` / `app-unauthenticated-error.ts` | Expected failures; 401 for missing session |
| `lib/utils.ts` | `cn()` and project-wide `Icon` type alias |

Other `lib/` folders (`currency/`, `date/`, `db/utils.ts`, …) follow the same one-concern-per-folder pattern — browse or grep the folder.

## App shell

Protected app chrome lives at `src/routes/app/route.tsx`:

- **Session guard** — `AppLayout` uses `useAuth()`; missing session → `/login` with `redirect` search param. See [auth-patterns](./auth-patterns.md).
- **Sidebar** — `AppSidebar` from `components/ui/app-sidebar.tsx`; nav items in `lib/sidebar/sidebar-items.ts`.
- **Outlet pending UI** — `<Suspense fallback={<LoadingSpinner />}>` wraps `<Outlet />`. Catches `useSuspenseQuery` suspends in child routes. See [ADR-0003 § Layout-level pending UI](../adr/0003-server-functions-and-data-fetching.md#layout-level-pending-ui).

**Sidebar open state (SSR seed, not a query subscription):** `beforeLoad` calls `readSidebarOpen()` → route context `sidebarOpen` → `AppSidebar defaultOpen` → private `useState` in the sidebar root. Toggle writes the cookie only (not on mount). Do not treat `sidebarOpen` context as live data after mount — runtime state is component-local.

## `src/features/`

Each feature owns queries, mutations, schemas, and optional `lib/` helpers. See [ADR-0003](../adr/0003-server-functions-and-data-fetching.md) and [feature-end-to-end](./feature-end-to-end.md).

**Live domain reference:** `src/features/cash-accounts/`

## `src/db/`

See [ADR-0004](../adr/0004-database-schema-layout.md). Entry: `db/index.ts`, `db/schemas/`, `db/relations.ts`, shared columns in `lib/db/utils.ts`.

## Dev tools

| Path | Purpose | Agent policy |
|------|---------|--------------|
| `tools/clear-db.ts` | Drop all tables + migrations for local dev reset | **Never run** — human dev only |

## Related docs

- [ADR-0001](../adr/0001-form-input-architecture.md) — form input stack
- [ADR-0002](../adr/0002-auth-boundary-and-route-guards.md) — auth boundary
- [ADR-0003](../adr/0003-server-functions-and-data-fetching.md) — serverFns + data fetching
- [ADR-0004](../adr/0004-database-schema-layout.md) — database schema layout
