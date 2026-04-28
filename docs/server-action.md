# Server Action Conventions

## Goal

Define a single, repeatable path for invoking server functions:
always through query/mutation options factories.

## File Pattern

Each action lives in its own file under `src/api/`, for example:

- `src/api/signup.ts`
- `src/api/login.ts`
- `src/api/expense-update.ts`

Each file should contain:

1. Form schema (Zod)
2. Server input schema (Zod)
3. Internal `createServerFn` declaration
4. Exported options factories (`*QueryOptions`, `*MutationOptions`)

Do not export the raw server function for direct use in routes/components/loaders.

## Two-Schema Rule

Use two schemas for mutation-style form actions:

- `formSchema`: fields owned by the UI form
- `serverInputSchema`: request payload shape for the server function

Example shape:

- `formSchema`: `{ name, email, password, confirmPassword }`
- `serverInputSchema`: `{ data: formSchema }`

Why this matters:

- keeps form concerns separated from transport/server concerns
- allows extra non-form inputs when needed (for example `id` in edit flows)
- keeps server validators explicit and extensible

## Server Function Rule

- Use `createServerFn({ method: "POST" | "GET" })`
- Always attach `.inputValidator(serverInputSchema)`
- Handle validated input inside `.handler(...)`

## Response Payload Rule

Use a standardized API response envelope.

- Success shape: `{ success: true, data?: TData, meta?: { [key: string]: JsonValue | undefined } }`
- Error shape: `{ success: false, error: { code, message, details? } }`
- Do not return raw ad-hoc objects from server actions.

Use the shared helpers in server handlers:

- `createSuccessResponse(data?, meta?)`
- `createErrorResponse(code, message, details?)`
- `createErrorResponse(error, { knownErrorCode, fallbackMessage, fallbackCode? })`
  for caught `unknown` errors

Return only the minimum data the caller actually needs in `data`.

## Single Access Path Rule

Server functions are called through app options factories only.

Use app factories in:

- Hooks:
  - `useMutation(createAppMutationOptions(...))`
  - `useQuery(createAppQueryOptions(...))`
- Loader/cache flows:
  - `ensureQueryData(createAppQueryOptions(...))`
  - `prefetchQuery(createAppQueryOptions(...))`
  - `fetchQuery(createAppQueryOptions(...))`

`createAppMutationOptions` / `createAppQueryOptions` unwrap API responses and
throw on `success: false`, creating a centralized path for:

- consistent error handling
- future toasts/metrics instrumentation
- shared success/failure behavior without per-endpoint branching in UI

Do not call `mutationOptions` / `queryOptions` directly for server actions.
Do not call server functions directly from route components, loaders, or UI handlers.

## Query Error Policy Rule

When creating app query factories through `createAppQueryOptions`:

- Default behavior should throw errors (`throwOnError: true`) so failures can
  bubble into route error boundaries.
- Retry behavior should follow shared defaults:
  - do not retry unauthorized (`401`) failures
  - retry other failures up to the shared cap
- If a specific query needs local handling, use per-query overrides instead of
  forking helper implementations.

This preserves a boundary-first default while allowing targeted exceptions.

## Auth Redirect Rule

For post-auth flows (signup/login), use a shared redirect helper:

- Define redirect destination in `src/lib/auth-redirect.ts`
- Consume `getPostAuthRedirectTo()` in auth routes after successful mutation
- Do not hardcode path strings like `"/"` in each auth page

This keeps auth navigation centralized so destination updates (for example,
moving to `/app` dashboard) happen in one place.

The `/app` index route should also redirect to `getPostAuthRedirectTo()` so
direct access to `/app` stays aligned with post-auth destination behavior.

## Auth Guard + Query Subscription Rule

- For authenticated route segments, use query hooks in layout components
  (`useQuery` / `useSuspenseQuery`) as the source of truth for auth state.
- Do not rely on loader-returned auth data for access decisions.
- If prefetch is needed for performance, treat it as warm-up only; keep the
  access check query-subscribed in the layout component.

## Form Integration Rule

- Reuse the same `formSchema` in TanStack Form `validators.onChange`
- On submit, pass values into the mutation payload matching the server input schema
  - example: `mutateAsync({ data: value })`

This keeps form validation and server validation aligned while preserving
layered schema responsibilities.
