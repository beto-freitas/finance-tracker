# Auth patterns

Practical guide for implementing auth routes and auth-related data flows under [ADR-0002](../adr/0002-auth-boundary-and-route-guards.md).

General serverFn, loader, and page conventions: [ADR-0003](../adr/0003-server-functions-and-data-fetching.md) and [`feature-end-to-end.md`](./feature-end-to-end.md). Import paths: [`project-layout.md`](./project-layout.md).

## Keep this guide current

When auth route topology, auth mutation call path, session query strategy, toast behavior, or `authMiddleware` changes, update this guide and [ADR-0002](../adr/0002-auth-boundary-and-route-guards.md) in the same PR.

## Core rules

- Use Better Auth transport for `login`, `signup`, and `logout` inside auth mutation modules — not `createServerFn`.
- Do not call `authClient` directly in route or form components.
- Call auth operations through exported option factories in `src/features/auth/mutations/`.
- Read session state through `sessionQueryOptions()` or `useAuth()`.
- Failures toast via `appMutationFn`; forms do not render inline server error banners.

## File map

- Schemas:
  - `src/features/auth/schemas/login-form-schema.ts`
  - `src/features/auth/schemas/signup-form-schema.ts`
- Auth mutations:
  - `src/features/auth/mutations/login-mutation-options.ts`
  - `src/features/auth/mutations/signup-mutation-options.ts`
  - `src/features/auth/mutations/logout-mutation-options.ts`
- Session primitive:
  - `src/features/auth/lib/get-auth-session.ts` (`getAuthSessionServerFn`)
- Session query:
  - `src/features/auth/queries/session-query-options.ts`
- Auth server/client:
  - `src/lib/auth/auth-server.ts` (`authServer`)
  - `src/lib/auth/auth-client.ts` (`authClient`)
- Middleware:
  - `src/lib/server-fn/auth-middleware.ts`
  - `src/lib/errors/app-unauthenticated-error.ts`
- Session hook:
  - `src/lib/hooks/use-auth.ts`
- Guards:
  - `src/routes/_auth/route.tsx`
  - `src/routes/app/route.tsx`

## Route structure

- Public auth routes:
  - `/login` (`src/routes/_auth/login/index.tsx`, form in `-lib/login-form.tsx`)
  - `/signup` (`src/routes/_auth/signup/index.tsx`, form in `-lib/signup-form.tsx`)
- Protected routes:
  - `/app/dashboard` (`src/routes/app/dashboard/index.tsx`)
  - `/app/cash-accounts` (`src/routes/app/cash-accounts/index.tsx`)

Login search params (`redirect`) are defined on the login route with `zodValidator`.

## Form + mutation pattern (auth exception)

Auth mutations use **`authClient`**, not `createServerFn`. They still use `appMutationFn`, `createSuccessResponse`, and `invalidateOnSuccess`.

1. Define form schema in `src/features/auth/schemas/`.
2. Build route-local form component under `-lib/` with `useAppForm` and `useXFormDefaultValues()` returning `{ … } satisfies XFormValues as XFormValues`.
3. In the form component:
   - `useMutation(loginMutationOptions())` (or signup/logout factory)
   - **`await mutateAsync({ formData: value })`** from `onSubmit` — **not** `{ data: { formData } }` (that shape is for domain serverFns only)
   - on success, navigate (e.g. `/app/dashboard` or `search.redirect`)
4. On success, mutation options invalidate `sessionQueryOptions().queryKey` via `invalidateOnSuccess`.
5. Do **not** set `mutationKey` on auth mutations — invalidate explicitly only.
6. On failure, `mutateAsync` throws; `appMutationFn` toasts the message.

Live references: `src/routes/_auth/login/-lib/login-form.tsx`, `src/features/auth/mutations/login-mutation-options.ts`.

## Session guard pattern

Guards live in **layout route components** (`AuthLayout`, `AppLayout`), not `beforeLoad`:

- Guest-only group (`_auth`): `useAuth()` → if session exists, `<Navigate to="/app/dashboard" />`.
- Protected app group (`/app`): `useAuth()` → if session missing, `<Navigate to="/login" search={{ redirect: location.href }} />`.

Session subscription uses the same `sessionQueryOptions()` factory as everywhere else.

Layout guards are **UX-only**. They do not replace server-side auth on protected handlers.

## Session cache hygiene

TanStack Query caches domain data per browser session. Clear it when the authenticated user changes so the next session never reads stale data from the previous one.

**Today**

- **Guest guard (`_auth`):** if `useAuth()` finds a session, `AuthLayout` calls `queryClient.clear()` then redirects to `/app/dashboard`. Prevents a logged-in user who lands on `/login` from carrying another user's cached queries if they had switched accounts elsewhere.
- **Logout (sidebar):** `logoutMutationOptions` invalidates `sessionQueryOptions` only. No explicit `navigate` — session goes null → `AppLayout` guard redirects to `/login`.

**Planned**

- Move `queryClient.clear()` to `logoutMutationOptions` `onSuccess` (and remove the `_auth` guard clear once that is in place). Use `queryClientOnSuccess` from `lib/query/query-client-on-success.ts` to access the client in `onSuccess`, same pattern as `invalidateOnSuccess`.

Do not rely on layout guards alone to isolate cache between users — guards redirect; they do not wipe query data.

## Protected serverFns — `authMiddleware`

Domain GET/POST serverFns that read or write authenticated user data **must** use `authMiddleware`. RPCs remain callable via direct HTTP requests even when the UI redirects unauthenticated users.

```ts
import { authMiddleware } from "#/lib/server-fn/auth-middleware";

const getCashAccountListServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }) => {
    // user already verified — do not call getSession again here
    return createSuccessResponse({ data: items });
  });
```

- Missing session → `AppUnauthenticatedError` → toast on client.
- Apply to **every protected serverFn**, including GET reads — same bar as mutations.
- **`getAuthSessionServerFn`** is the shared session primitive (used by middleware internals and session query).
- **Session query** (`sessionQueryOptions`) stays **without** middleware — it only reports whether a session exists.

## Domain vs auth call shapes

| | Domain serverFn | Auth mutation |
|--|-----------------|---------------|
| Transport | `createServerFn` | `authClient` |
| Middleware | `authMiddleware` when user-scoped | N/A |
| Mutation wiring | `appMutationFn(serverFn)` direct | Thin wrapper + `authClient` |
| Form `mutateAsync` | `{ data: { formData: value, … } }` | `{ formData: value }` |

## What auth shares with domain features

Auth mutations are **not** an exception to `appMutationFn`, `createSuccessResponse`, or `invalidateOnSuccess`. The auth-specific deviations are: **`authClient`** instead of **`createServerFn`**, and **`{ formData }`** instead of **`{ data: { formData } }`** on `mutateAsync`.

Session **reads** use a private GET `createServerFn` like domain queries — see `session-query-options.ts`.

## What not to do

- Do not call `authClient` from routes or `-lib` forms.
- Do not use `beforeLoad` / `useLoaderData` for session — subscribe with `useAuth()` / `sessionQueryOptions()`.
- Do not add inline “invalid email or password” server error regions — rely on toasts and let the user retry.
- Do not skip `authMiddleware` on protected domain serverFns because layout guards exist.
- Do not call `getSession` manually in domain handlers when middleware already ran.
