# Routing, Auth, and Error Boundaries Conventions

## Goal

Define a consistent routing and failure-handling strategy for authenticated app
areas built with TanStack Router + TanStack Query.

## Route Structure

- Public routes live directly under `src/routes/` (for example `/`, `/login`, `/signup`).
- Authenticated app routes live under `src/routes/app/`.
- `src/routes/app/route.tsx` is the parent route for the `/app` segment.
- `src/routes/app/index.tsx` owns index behavior for `/app`.
- Child pages (for example dashboard) live under `src/routes/app/` as nested files.

## Redirect Rules

### Post-Auth Redirect

- The single source of truth for post-login/signup destination is
  `src/lib/auth-redirect.ts`.
- Auth pages must call `getPostAuthRedirectTo()` after successful mutations.
- Do not hardcode dashboard/app paths directly in auth pages.

### `/app` Index Redirect

- `/app` index route (`src/routes/app/index.tsx`) must redirect with `beforeLoad`
  to `getPostAuthRedirectTo()`.
- This keeps app entry and post-auth destination aligned.

## Auth Guard Rule

- Protected app access checks must be query-subscribed in the app layout
  component, not derived from loader-returned auth data.
- Use `useSuspenseQuery(sessionQueryOptions())` in `src/routes/app/route.tsx`.
- If user is missing, return `<Navigate to="/login" />`.

Rationale:

- keeps auth state reactive to query cache changes
- avoids drift between loader snapshots and runtime auth state

## Loader Rule for Authenticated Layouts

- Do not duplicate auth checks between loader and layout query.
- Prefer a single source of truth via suspense query in layout.
- Loader prefetch can be used for performance in future routes, but auth decision
  should stay query-driven.

## Route Error Boundary Rule

Use explicit route boundaries instead of implicit framework defaults:

- Root boundary in `src/routes/__root.tsx`
- App segment boundary in `src/routes/app/route.tsx`

Boundary responsibility:

- Root boundary: uncaught/global failures
- App boundary: failures inside authenticated app segment

## Error UI Components Rule

- Reusable boundary UI components live in `src/components/errors/`.
- Current components:
  - `app-error-state.tsx`
  - `global-error-state.tsx`
- Error UI must provide:
  - retry action (`reset`)
  - a safe navigation action so users are not trapped

## Route-Safe Matching Rule

When branching behavior by route, prefer TanStack Router typed matching:

- use `useMatchRoute()` with typed `to` targets
- avoid direct string pathname comparisons when possible

This prevents silent breakage when route paths are refactored.

## Query Error Policy

`createAppQueryOptions` in `src/lib/api-client.ts` is the default source for
server-function-backed queries:

- defaults to `throwOnError: true`
- default retry policy disables retry for `401` and retries other errors up to a
  capped count
- allows per-query overrides via `overrides`

Use overrides only when a route/component needs local behavior that differs from
the default boundary-first strategy.
