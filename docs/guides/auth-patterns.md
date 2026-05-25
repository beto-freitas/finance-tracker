# Auth patterns

Practical guide for implementing auth routes and auth-related data flows under [ADR-0002](../adr/0002-auth-boundary-and-route-guards.md).

General serverFn, loader, and page conventions: [ADR-0003](../adr/0003-server-functions-and-data-fetching.md) and [`feature-end-to-end.md`](./feature-end-to-end.md).

## Keep this guide current

When auth route topology, auth mutation call path, session query strategy, toast behavior, or **`authMiddleware`** changes, update this guide and [ADR-0002](../adr/0002-auth-boundary-and-route-guards.md) in the same PR.

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
- Session query:
  - `src/features/auth/queries/session-query-options.ts`
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

Login search params (`redirect`) are defined on the login route with `zodValidator`.

## Form + mutation pattern

1. Define form schema in `src/features/auth/schemas/`.
2. Build route-local form component under `-lib/` with `useAppForm` and `useXFormDefaultValues()` returning `{ … } satisfies XFormValues`.
3. In the form component:
   - `useMutation(loginMutationOptions())` (or signup/logout factory)
   - `await mutateAsync({ formData: value })` from `onSubmit`
   - on success, navigate (e.g. `/app/dashboard` or `search.redirect`)
4. On success, mutation options invalidate `sessionQueryOptions().queryKey` via `invalidateOnSuccess`.
5. On failure, `mutateAsync` throws; `appMutationFn` toasts the message — no extra catch UI unless you need to reset form state.

Live references: `src/routes/_auth/login/-lib/login-form.tsx`, `src/features/auth/mutations/login-mutation-options.ts`.

## Session guard pattern

Guards live in **layout route components** (`AuthLayout`, `AppLayout`), not `beforeLoad`:

- Guest-only group (`_auth`): `useAuth()` → if session exists, `<Navigate to="/app/dashboard" />`.
- Protected app group (`/app`): `useAuth()` → if session missing, `<Navigate to="/login" search={{ redirect: location.href }} />`.

Session subscription uses the same `sessionQueryOptions()` factory as everywhere else.

Layout guards are **UX-only**. They do not replace server-side auth on protected handlers.

## Protected serverFns — `authMiddleware` (planned)

Domain GET/POST serverFns under `/app/*` must enforce a valid session on the server, not rely on the client redirect.

**Planned pattern** (not implemented yet):

```ts
const getIncomeListServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(incomeListInputSchema)
  .handler(async ({ data }) => {
    // session already verified by middleware
    return createSuccessResponse({ data: items });
  });
```

- `authMiddleware` will reject unauthenticated calls before the handler runs (throw `AppError` or equivalent → toast on client).
- Apply to **every protected serverFn**, including GET reads — same bar as mutations.
- Session read (`getSessionServerFn`) stays unauthenticated middleware-wise; it only reports whether a session exists.
- When the middleware PR lands, update this section and [ADR-0003](../adr/0003-server-functions-and-data-fetching.md) with the final API and file path.

Until then, handlers must still verify session manually inside the handler body — do not skip server checks because layout guards exist.

## What auth shares with domain features

Auth mutations are **not** an exception to `appMutationFn`, `createSuccessResponse`, or `invalidateOnSuccess`. The **only** auth-specific deviation is calling **`authClient`** instead of **`createServerFn`** for login, signup, and logout.

Session **reads** use a private GET `createServerFn` like domain queries — see `session-query-options.ts`.

## What not to do

- Do not call `authClient` from routes or `-lib` forms.
- Do not use `beforeLoad` / `useLoaderData` for session — subscribe with `useAuth()` / `sessionQueryOptions()`.
- Do not add inline “invalid email or password” server error regions — rely on toasts and let the user retry.
- Do not skip server-side session checks in protected serverFns — use `authMiddleware` once available; until then, verify in the handler.
