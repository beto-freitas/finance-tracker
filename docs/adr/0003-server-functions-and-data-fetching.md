# Server functions and data fetching

TanStack Start server functions and TanStack Query share a single RPC-style data layer: feature modules own serverFns and option factories; routes prefetch and subscribe; success and failure follow one envelope contract.

**Guide:** step-by-step instructions for adding a query, mutation, and page live in [`docs/guides/feature-end-to-end.md`](../guides/feature-end-to-end.md).

## Context

- Domain features need a repeatable path from server handler → query/mutation options → route UI without ad-hoc fetches or REST-shaped payloads.
- TanStack Start `createServerFn` is the default server boundary for non-auth operations.
- TanStack Query caches and invalidates client state; route `loader`s can start fetches early but are not reactive subscribers.
- Auth already integrates Better Auth with an explicit transport exception (see [ADR-0002](./0002-auth-boundary-and-route-guards.md)).

## Decision

### RPC, not REST

- Server functions are **RPC calls**, not REST resources.
- A GET serverFn returns **exactly what its caller needs** for that context — not a generic table row or CRUD envelope.
- Name private serverFns by intent (e.g. `getIncomeListServerFn`) and shape `data` for the list UI, not “all columns because the table has them.”

### Feature module layout

```
src/features/{feature}/
  queries/     *-query-options.ts   → export *QueryOptions() factories
  mutations/   *-mutation-options.ts → export *MutationOptions() factories
  schemas/     *-form-schema.ts     → export *FormSchema, *FormValues (when forms exist)
  lib/         optional — shared helpers when reused across modules in this feature
```

- **File name = export name:** `income-list-query-options.ts` exports `incomeListQueryOptions()`; `login-form-schema.ts` exports `loginFormSchema`.
- **`createServerFn` handlers stay module-private** (not exported). Routes and other features import option factories and schemas only.
- **`src/features/{feature}/lib/`** — add only when the same helper is reused across multiple query/mutation modules; inline handler logic is fine otherwise.
- **Domain business rules** (glossary concepts, money calculations) live in `src/domain/` per project conventions — feature `lib/` is for feature-scoped glue, not core domain logic.

**Live reference:** `src/features/auth/` (session query + auth mutations). **Illustrative domain walkthrough:** the guide’s hypothetical `income` feature.

### Server function contract

**Success**

- Handlers return `createSuccessResponse({ data?, message?, status? })`.
- Include `message` only when a success toast is intentional; omit it for silent success.

**Failure**

- Handlers **throw** `new AppError({ message, status?, code? })` for expected failures (e.g. duplicate income source).
- Do **not** return error envelopes inside `createSuccessResponse`.
- Client-facing feedback is **toast-only** via `appQueryFn` / `appMutationFn` — no inline “server error” banners on forms. Users retry after reading the toast.

**Input**

- **No client input:** omit `.inputValidator`; call the serverFn with no args; the query factory takes no input parameter. **Live reference:** `sessionQueryOptions()` in `src/features/auth/queries/session-query-options.ts`. Do not use `z.object({})` or `{}` to simulate this.
- **With input:** define a Zod schema, attach `.inputValidator(schema)` (pass the schema directly — **not** `zodValidator`, which is reserved for route `validateSearch`), export the inferred type (e.g. `IncomeListInput`), and pass **one object** into the query factory, `queryKey`, and `getXServerFn({ data: input })` so keys and RPC args never drift.
- **Form-driven mutations:** wrap the shared form schema — `z.object({ formData: myFormSchema, otherInputOutsideForm: z.string() })` — so client and server share one form definition. `otherInputOutsideForm` could be an Id for editing, which isn't on the form but is needed on the mutation.
- **Non-form mutations:** use a flat, purpose-named schema (e.g. `z.object({ incomeSourceId: z.string() })`) without a `formData` key.

**Protection (planned)**

- Protected serverFns will use `.middleware([authMiddleware])` once landed in a follow-up PR.
- **Route guards are UX-only** — every protected handler must still enforce auth on the server. Until middleware exists, document intent here; do not skip server-side checks in handlers.

Example shape (illustrative):

```ts
const createIncomeSourceServerFn = createServerFn({ method: "POST" })
  .inputValidator(createIncomeSourceInputSchema)
  // .middleware([authMiddleware]) — planned
  .handler(async ({ data }) => {
    // … enforce session, domain logic …
    return createSuccessResponse({ message: "Income source created" });
  });
```

### Query and mutation option factories

- Each exported factory wraps TanStack Query’s `queryOptions()` / `mutationOptions()`.
- **`queryFn` / `mutationFn`:** use `appQueryFn` / `appMutationFn` so callers get unwrapped `data` and automatic toasts when the envelope includes `message` or when an error is thrown.
- **Invalidation:** use `invalidateOnSuccess(args, someQueryOptions().queryKey)` — derive keys from the target factory, do not duplicate key arrays.
- **Auth transport exception:** `login`, `signup`, and `logout` call `authClient` instead of `createServerFn`, but still use `appMutationFn`, `createSuccessResponse`, and `invalidateOnSuccess` like domain mutations. See [ADR-0002](./0002-auth-boundary-and-route-guards.md).

### Route file topology

- Pages live at `src/routes/.../page-name/index.tsx`, not flat `page-name.tsx` — room for a sibling `route.tsx` and a `-lib/` directory.
- Route-scoped UI, forms, and page wiring hooks live under `src/routes/.../page-name/-lib/`.
- **Search params:** define the Zod search schema in the route file and parse with `zodValidator` from `@tanstack/zod-adapter` — **`zodValidator` is for `validateSearch` only**, not serverFn input.
- **Search-driven loaders:** use `loaderDeps` to pick validated search fields, then pass the mapped input into `ensureQueryData(someQueryOptions(input))`. Do not re-parse search in the loader; do not read search directly in the loader without `loaderDeps` (breaks cache identity).

Forms on routes follow [ADR-0001](./0001-form-input-architecture.md): dedicated form component in `-lib/`, `useXFormDefaultValues()` returning `{ … } satisfies XFormValues`, and `useAppForm` with registered field components.

### Prefetch vs subscribe (critical)

**`loader` / `beforeLoad` are not subscribers.**

- Use `queryClient.ensureQueryData(someQueryOptions(input))` in a route `loader` **only to start the fetch early** (fewer round-trips, faster first paint). When search params affect the query, declare them in `loaderDeps` first.
- **Never** treat loader/beforeLoad return value as live data — **do not** read query results via `Route.useLoaderData()` for data that must stay fresh after invalidation. Loader output **will go stale** when query keys invalidate; loaders do not re-run as query subscribers.
- **Components are the source of truth:** subscribe with `useSuspenseQuery(someQueryOptions(input))` or `useQuery(...)` using the **same** input object as the loader.

**Hook choice**

| Data role | Hook | Loader prefetch? |
|-----------|------|------------------|
| Primary page content (e.g. income list) | `useSuspenseQuery` | Yes — `ensureQueryData` in `loader` |
| Secondary / on-demand (e.g. edit panel, dialog) | `useQuery` with local pending/error UI | Optional |

TanStack Start route trees are wrapped in **Suspense by default**, so `useSuspenseQuery` on primary page data does not require adding a custom boundary in each route. **Page skeletons** for pending UI are a planned follow-up.

### Route `-lib` vs feature layer

- **Feature folder:** transport and contracts — option factories, schemas, `lib/` helpers.
- **Route `-lib/`:** composition — which queries/mutations the page uses, navigation after success, page-specific derived state.
- Thin hooks like `useIncomeList(input)` that only call `useSuspenseQuery(incomeListQueryOptions(input))` belong in `-lib/` until a second route genuinely shares them.

## Consequences

- One envelope type (`SuccessResponse` + thrown `AppError`) drives unwrapping, typing, and toasts across features.
- Invalidation stays correct because UI always subscribes through Query hooks, not loader snapshots.
- Feature folders stay import-safe: no leaked serverFns, predictable public surface.
- New domain work copies the guide’s template; auth remains the documented exception for transport only.

## Follow-up

- **`authMiddleware`** for protected serverFns — wire `.middleware([authMiddleware])` and document usage when the PR lands; update this ADR’s planned snippet to match implementation.
- **Route skeletons** for suspense pending UI.
- First real domain feature should replace or narrow the guide’s hypothetical `income` example with live file paths.

## Keeping this ADR current

When you change the server function **architecture** — RPC return shapes, feature module layout, export boundaries, `SuccessResponse`/`AppError` contract, `appQueryFn`/`appMutationFn` behavior, loader vs subscribe rules, route topology, or hook defaults — update this ADR in the same PR. If the change also affects the how-to steps, update [`docs/guides/feature-end-to-end.md`](../guides/feature-end-to-end.md) in the same PR. Stale ADRs are worse than none; treat doc updates as part of the definition change, not a follow-up.
