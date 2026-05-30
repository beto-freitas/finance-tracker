# Auth boundary and route guards

Authentication keeps Better Auth as its transport boundary, while the app standardizes how routes call auth operations and how protected routes are enforced.

Shared query/mutation, loader, and route conventions live in [ADR-0003](./0003-server-functions-and-data-fetching.md). This ADR covers **auth-only** exceptions and guard topology.

## Context

- We need the first end-to-end login implementation to set durable patterns for future mutations, server functions, and route protection.
- Better Auth is already integrated with TanStack Start (`/api/auth/$` handlers plus `authClient`).
- We want a strict call path from UI to auth operations, without direct provider calls spread across routes.
- We need route-level protection that works for both first server render and client navigation.

## Decision

### Auth transport exception

- Auth operations (`login`, `signup`, `logout`) are an explicit exception to the default **`createServerFn` mutation** pattern.
- They call Better Auth through `authClient` transport instead of a POST serverFn.
- Route and form components must not call `authClient` directly; they must use exported option factories from `src/features/auth/mutations/`.
- They still use the shared envelope and wrappers: `createSuccessResponse`, `appMutationFn`, and `invalidateOnSuccess` — same as domain mutations in [ADR-0003](./0003-server-functions-and-data-fetching.md).

### Session query

- Session reads are centralized in `sessionQueryOptions()` (`src/features/auth/queries/session-query-options.ts`).
- A **private** GET `createServerFn` loads the session server-side; the exported factory wraps it with `appQueryFn`.
- Guards and components subscribe through `sessionQueryOptions()` / `useAuth()` — not ad-hoc `authClient` session calls.

### Route guards (layout components)

Guards run in **layout route components**, not `beforeLoad` loader data:

- `src/routes/_auth/route.tsx` — guest-only: if session exists, redirect to `/app/dashboard`.
- `src/routes/app/route.tsx` — protected: if session is missing, redirect to `/login` with `redirect` search param set to the current URL.

Both layouts call `useAuth()`, which uses `useSuspenseQuery(sessionQueryOptions())`. TanStack Start provides a Suspense ancestor for route trees by default.

**Server-side enforcement** for protected domain operations uses `authMiddleware` on serverFns ([ADR-0003](./0003-server-functions-and-data-fetching.md#protection--authmiddleware)). Layout guards are not a substitute.

### Route topology

- Public auth pages live in the `_auth` group:
  - `/login`
  - `/signup`
- Protected pages live under `/app/*`.
- `/app/dashboard` is the canonical first protected path.

### Form/schema pattern

- Auth forms use TanStack Form via `useAppForm` (see [ADR-0001](./0001-form-input-architecture.md)).
- Zod form schema is the source of truth per form (`src/features/auth/schemas/`).
- Mutation input is wrapped as `{ formData: <formSchema> }` to keep extension-friendly input contracts.
- Auth and server failures surface as **toasts** via thrown errors and `appMutationFn` — not inline server error UI on the form.

## Consequences

- Auth logic is centralized and easier to evolve without touching route internals.
- Guard behavior is consistent on server render and client navigation through shared session query subscription.
- Domain features follow [ADR-0003](./0003-server-functions-and-data-fetching.md); auth remains the single transport exception for mutations.

## Keeping this ADR current

When you change the auth **boundary** — Better Auth call path, guard topology, session query strategy, or what remains auth-specific vs shared with ADR-0003 — update this ADR in the same PR. If the change also affects practical steps, update [`docs/guides/auth-patterns.md`](../guides/auth-patterns.md) in the same PR. Stale ADRs are worse than none; treat doc updates as part of the definition change, not a follow-up.
