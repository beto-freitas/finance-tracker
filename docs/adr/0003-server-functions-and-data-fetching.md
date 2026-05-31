# Server functions and data fetching

TanStack Start server functions and TanStack Query share a single RPC-style data layer: feature modules own serverFns and option factories; routes prefetch and subscribe; success and failure follow one envelope contract.

**Guides:** step-by-step feature walkthrough in [`docs/guides/feature-end-to-end.md`](../guides/feature-end-to-end.md); import paths in [`docs/guides/project-layout.md`](../guides/project-layout.md).

## Context

- Domain features need a repeatable path from server handler → query/mutation options → route UI without ad-hoc fetches or REST-shaped payloads.
- TanStack Start `createServerFn` is the default server boundary for non-auth operations.
- TanStack Query caches and invalidates client state; route `loader`s can start fetches early but are not reactive subscribers.
- Auth integrates Better Auth with an explicit transport exception (see [ADR-0002](./0002-auth-boundary-and-route-guards.md)).

## Decision

### RPC, not REST

- Server functions are **RPC calls**, not REST resources.
- A GET serverFn returns **exactly what its caller needs** for that context — not a generic table row or CRUD envelope.
- Name private serverFns by intent (e.g. `getCashAccountListServerFn`) and shape `data` for the list UI, not “all columns because the table has them.”

### Feature module layout

```
src/features/{feature}/
  queries/     *-query-options.ts   → export *QueryOptions() factories
  mutations/   *-mutation-options.ts → export *MutationOptions() factories
  schemas/     *-form-schema.ts     → export *FormSchema, *FormValues (when forms exist)
  lib/         optional — shared helpers when reused across modules in this feature
```

- **File name = export name:** `cash-account-list-query-options.ts` exports `cashAccountListQueryOptions()`; `login-form-schema.ts` exports `loginFormSchema`.
- **`createServerFn` handlers stay module-private** (not exported). Routes and other features import option factories and schemas only.
- **`src/features/{feature}/lib/`** — add when the same helper is reused across multiple query/mutation modules (e.g. `get-first-cash-account.ts`, `*-errors.ts`); inline handler logic is fine for one-offs.
- **Domain business rules** (glossary concepts, money calculations) live in `src/domain/` per project conventions — feature `lib/` is for feature-scoped glue, not core domain logic.

**Live references:** `src/features/auth/` (session + auth mutations); `src/features/cash-accounts/` (first domain feature).

### Server function contract

**Success**

- Handlers return `createSuccessResponse({ data?, message?, status? })`.
- Include `message` only when a success toast is intentional; omit it for silent success.

**Failure**

- Handlers **throw** for expected failures — either a feature-specific `AppError` subclass or inline `new AppError({ message, status?, code? })`.
- Reusable domain rules → subclass in `features/{feature}/lib/*-errors.ts` (e.g. `ExistingCashAccountError`).
- Cross-cutting auth → `AppUnauthenticatedError` in `lib/errors/`.
- One-off failures → inline `AppError` in the handler.
- Do **not** return error envelopes inside `createSuccessResponse`.
- Client-facing feedback is **toast-only** via `appQueryFn` / `appMutationFn` — no inline “server error” banners on forms.

**Input**

- **No client input:** omit `.inputValidator`; call the serverFn with no args; the query factory takes no input parameter. **Live reference:** `sessionQueryOptions()` in `src/features/auth/queries/session-query-options.ts`. Do not use `z.object({})` or `{}` to simulate this.
- **With input:** define a Zod schema, attach `.inputValidator(schema)` (pass the schema directly — **not** `zodValidator`, which is reserved for route `validateSearch`), export the inferred type, and pass **one object** into the query factory, `queryKey`, and `getXServerFn({ data: input })` so keys and RPC args never drift.
- **Form-driven mutations:** wrap the shared form schema — `z.object({ formData: myFormSchema, otherInputOutsideForm: z.string() })` — so client and server share one form definition. `otherInputOutsideForm` could be an Id for editing, which isn't on the form but is needed on the mutation.
- **Non-form mutations:** use a flat, purpose-named schema (e.g. `z.object({ cashAccountId: z.string() })`) without a `formData` key.

**Protection — `authMiddleware`**

Protected serverFns that read or write **authenticated user data** must use `.middleware([authMiddleware])` from [`src/lib/server-fn/auth-middleware.ts`](../../src/lib/server-fn/auth-middleware.ts).

- Handlers receive `context.user` from middleware — do not call `getSession` again in domain handlers.
- Missing session → `AppUnauthenticatedError` (401 toast on client).
- **Route guards are UX-only** — RPCs are still callable via direct requests; middleware is required even when `/app` layout redirects unauthenticated users.
- **Session read** (`sessionQueryOptions`) stays **without** middleware — it only reports whether a session exists.

Example:

```ts
const createCashAccountServerFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(createCashAccountMutationInputSchema)
  .handler(async ({ data, context: { user } }) => {
    // user already verified by middleware
    return createSuccessResponse({ message: "Cash account created" });
  });
```

### Query and mutation option factories

- Each exported factory wraps TanStack Query’s `queryOptions()` / `mutationOptions()`.
- **Do not set `mutationKey`** on `mutationOptions` — invalidate explicitly via `invalidateOnSuccess` in `onSuccess`.
- **Domain queries:** pass the serverFn directly — `queryFn: appQueryFn(getCashAccountListServerFn)` (no wrapper arrow for no-input GETs).
- **Domain mutations:** pass the serverFn directly — `mutationFn: appMutationFn(createCashAccountServerFn)` — no wrapper function unless pre-RPC client logic is needed.
- Forms call domain mutations with TanStack Start input shape: `mutateAsync({ data: { formData: value, … } })`.
- **`AppServerFnResult<typeof getXServerFn>`** in [`src/lib/server-fn/response-data.ts`](../../src/lib/server-fn/response-data.ts) derives RPC item types from the handler — avoid hand-written duplicates that drift.
- **Invalidation:** use `invalidateOnSuccess(args, someQueryOptions().queryKey)` — derive keys from the target factory, do not duplicate key arrays.
- **Auth transport exception:** `login`, `signup`, and `logout` call `authClient` instead of `createServerFn`, but still use `appMutationFn`, `createSuccessResponse`, and `invalidateOnSuccess`. Auth forms call `mutateAsync({ formData: value })` directly — not `{ data: … }`. See [ADR-0002](./0002-auth-boundary-and-route-guards.md).

### Route file topology

- Pages live at `src/routes/.../page-name/index.tsx`, not flat `page-name.tsx` — room for a sibling `route.tsx` and a `-lib/` directory.
- Route-scoped UI, forms, and page wiring hooks live under `src/routes/.../page-name/-lib/`.
- **Search params:** define the Zod search schema in the route file and parse with `zodValidator` from `@tanstack/zod-adapter` — **`zodValidator` is for `validateSearch` only**, not serverFn input.
- **Search-driven loaders:** use `loaderDeps` to pick validated search fields, then pass the mapped input into `ensureQueryData(someQueryOptions(input))`. Do not re-parse search in the loader; do not read search directly in the loader without `loaderDeps` (breaks cache identity).

Forms on routes follow [ADR-0001](./0001-form-input-architecture.md): dedicated form component in `-lib/`, `useXFormDefaultValues()` returning `{ … } satisfies XFormValues as XFormValues`, and `useAppForm` with registered field components.

### Prefetch vs subscribe (critical)

**`loader` / `beforeLoad` are not subscribers.**

- Use `queryClient.ensureQueryData(someQueryOptions(input))` in a route `loader` **only to start the fetch early** (fewer round-trips, faster first paint). When search params affect the query, declare them in `loaderDeps` first.
- **Never** treat loader/beforeLoad return value as live data — **do not** read query results via `Route.useLoaderData()` for data that must stay fresh after invalidation. Loader output **will go stale** when query keys invalidate; loaders do not re-run as query subscribers.
- **Components are the source of truth:** subscribe with `useSuspenseQuery(someQueryOptions(input))` or `useQuery(...)` using the **same** input object as the loader.

**Hook choice**

| Data role | Hook | Loader prefetch? |
|-----------|------|------------------|
| Primary page content (e.g. cash account list) | `useSuspenseQuery` | Yes — `ensureQueryData` in `loader` |
| Secondary / on-demand (e.g. edit panel, dialog) | `useQuery` with local pending/error UI | Optional |

### Layout-level pending UI

The `/app` layout wraps `<Outlet />` in React `<Suspense>` with a default `LoadingSpinner` fallback (`src/routes/app/route.tsx`). This catches suspends from **`useSuspenseQuery`** (and similar) in child route components — the primary pattern for domain data.

**Two separate mechanisms — do not conflate them:**

| Mechanism | What triggers it | Our usage |
|-----------|------------------|-----------|
| **React `<Suspense>`** (layout boundary) | Component render suspends (`useSuspenseQuery`, lazy imports) | Default pending UI for page data |
| **Router `pendingComponent`** | Async route `loader` / `beforeLoad` (after `pendingMs`, per TanStack Router docs) | Not configured today; unreliable for slow `beforeLoad` in practice ([router#1029](https://github.com/TanStack/router/discussions/1029)) |

**Critical:** `beforeLoad` and `loader` run **before** the layout component mounts. Slow work there does **not** pass through the app shell's React Suspense boundary — expect a blank page unless that route defines `pendingComponent`. Keep `beforeLoad` sync/fast (e.g. cookie reads for SSR seed). Use `useSuspenseQuery` in the page component for data that should show the layout spinner.

- **`loader` + `ensureQueryData`:** warms the cache before render; if data is ready when the page mounts, `useSuspenseQuery` may not suspend. A slow loader itself is router `pendingComponent` territory, not layout Suspense.
- **Per-route override:** set `pendingComponent` on a route when `useSuspenseQuery` is not the right fit and you need route-specific pending UI.

See also: app shell summary in [`project-layout.md`](../guides/project-layout.md#app-shell).

### Route `-lib` vs feature layer

- **Feature folder:** transport and contracts — option factories, schemas, `lib/` helpers.
- **Route `-lib/`:** composition — which queries/mutations the page uses, navigation after success, page-specific derived state.
- Thin hooks like `useCashAccountList()` that only call `useSuspenseQuery(cashAccountListQueryOptions())` belong in `-lib/` until a second route genuinely shares them.

## Consequences

- One envelope type (`SuccessResponse` + thrown `AppError`) drives unwrapping, typing, and toasts across features.
- Invalidation stays correct because UI always subscribes through Query hooks, not loader snapshots.
- Feature folders stay import-safe: no leaked serverFns, predictable public surface.
- New domain work copies `src/features/cash-accounts/`; auth remains the documented exception for transport only.

## Follow-up

- **Per-route pending UI** — optional `pendingComponent` where layout Suspense + `useSuspenseQuery` is not enough.
- **Generic balance field mapper** — helper over `{ balanceMinor }` objects/arrays with inferred `{ balanceMajor }` return when 3+ query handlers need it (see [feature-end-to-end](../guides/feature-end-to-end.md#persistence-conventions)).

## Keeping this ADR current

When you change the server function **architecture** — RPC return shapes, feature module layout, export boundaries, `SuccessResponse`/`AppError` contract, `appQueryFn`/`appMutationFn` behavior, loader vs subscribe rules, route topology, or hook defaults — update this ADR in the same PR. If the change also affects the how-to steps, update [`docs/guides/feature-end-to-end.md`](../guides/feature-end-to-end.md) in the same PR. Stale ADRs are worse than none; treat doc updates as part of the definition change, not a follow-up.
