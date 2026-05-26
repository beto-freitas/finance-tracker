# Feature end-to-end (serverFn → page)

How to add a domain query, mutation, and route using the patterns in [ADR-0003](../adr/0003-server-functions-and-data-fetching.md).

The walkthrough below uses a **hypothetical `income` feature** (not implemented yet) so the steps stay copy-pasteable. **Live code** today is under `src/features/auth/` — cross-link there for guards and forms; auth differs only where it calls `authClient` instead of `createServerFn` ([ADR-0002](../adr/0002-auth-boundary-and-route-guards.md)).

## Keep this guide current

When you add or change query/mutation factories, loader prefetch rules, route `-lib` conventions, or the serverFn envelope contract, update **this guide** in the same PR. If the change alters an architectural decision, update [ADR-0003](../adr/0003-server-functions-and-data-fetching.md) too. Code and docs should land together.

## Prerequisites

- Envelope helpers: `src/lib/server-fn/create-success-response.ts`, `src/lib/errors/app-error.ts`
- Query wrappers: `src/lib/query/app-query-fn.ts`, `src/lib/query/app-mutation-fn.ts`, `src/lib/query/invalidate-on-success.ts`
- Forms: [ADR-0001](../adr/0001-form-input-architecture.md), [`adding-form-fields.md`](./adding-form-fields.md)
- Live session query reference: `src/features/auth/queries/session-query-options.ts`

## Feature module checklist

| Path | Exports | Stays private |
|------|---------|---------------|
| `queries/income-list-query-options.ts` | `incomeListQueryOptions()` | `getIncomeListServerFn` |
| `mutations/create-income-source-mutation-options.ts` | `createIncomeSourceMutationOptions()` | `createIncomeSourceServerFn` |
| `schemas/create-income-source-form-schema.ts` | `createIncomeSourceFormSchema`, `CreateIncomeSourceFormValues` | — |
| `lib/` (optional) | shared helper — only when reused across multiple modules | — |

**Rule:** filename stem matches the exported symbol (`income-list-query-options.ts` → `incomeListQueryOptions`).

---

## 1. Query — list data (GET serverFn)

### No input

When the serverFn needs **no client input**, omit `.inputValidator` entirely. **Live reference:** `src/features/auth/queries/session-query-options.ts`.

```ts
const getSessionServerFn = createServerFn({ method: "GET" }).handler(async () => {
  return createSuccessResponse({ data: result });
});

export function sessionQueryOptions() {
  return queryOptions({
    queryKey: ["auth", "session"],
    queryFn: appQueryFn(() => getSessionServerFn()),
  });
}
```

Do not add `z.object({})` or pass `{}` just to unify factory signatures — that is unnecessary when there is nothing to validate or send.

### With input

When the serverFn **does** accept input, define a schema, derive the input type, and pass the **same object** to `queryKey` and `getXServerFn({ data: input })`.

**File:** `src/features/income/queries/income-list-query-options.ts`

Returns **only what the list UI needs** (RPC shape — not a REST “full row”).

```ts
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { appQueryFn } from "#/lib/query/app-query-fn";
import { createSuccessResponse } from "#/lib/server-fn/create-success-response";

const incomeListInputSchema = z.object({
  month: z.string().optional(),
});

type IncomeListInput = z.infer<typeof incomeListInputSchema>;

const getIncomeListServerFn = createServerFn({ method: "GET" })
  .inputValidator(incomeListInputSchema)
  // .middleware([authMiddleware]) — planned; enforce session in handler until then
  .handler(async ({ data }) => {
    const items = await db.select(/* … */); // inline handler logic is fine
    return createSuccessResponse({ data: items });
  });

export function incomeListQueryOptions(input: IncomeListInput) {
  return queryOptions({
    queryKey: ["income", "list", input],
    queryFn: appQueryFn(() => getIncomeListServerFn({ data: input })),
  });
}
```

**Notes**

- Derive `IncomeListInput` from the serverFn `inputValidator` schema and pass the **same object** to `queryKey` and `getIncomeListServerFn({ data: input })` — never maintain separate key/input shapes.
- No `message` on success → no success toast.
- Throw `new AppError({ message: "…" })` inside the handler for expected failures; `appQueryFn` toasts the message.
- **`zodValidator`** is for route `validateSearch` only — serverFns use `.inputValidator(zodSchema)` directly.

---

## 2. Mutation — form submit (POST serverFn)

**Schema:** `src/features/income/schemas/create-income-source-form-schema.ts`

```ts
import { z } from "zod";

export const createIncomeSourceFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type CreateIncomeSourceFormValues = z.infer<typeof createIncomeSourceFormSchema>;
```

**Mutation module:** `src/features/income/mutations/create-income-source-mutation-options.ts`

```ts
import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createIncomeSourceFormSchema } from "#/features/income/schemas/create-income-source-form-schema";
import { appMutationFn } from "#/lib/query/app-mutation-fn";
import { AppError } from "#/lib/errors/app-error";
import { createSuccessResponse } from "#/lib/server-fn/create-success-response";
import { incomeListQueryOptions } from "../queries/income-list-query-options";

const createIncomeSourceInputSchema = z.object({
  formData: createIncomeSourceFormSchema,
});

const createIncomeSourceServerFn = createServerFn({ method: "POST" })
  .inputValidator(createIncomeSourceInputSchema)
  .handler(async ({ data }) => {
    const exists = await db.query.incomeSources.findFirst({
      where: { name: data.formData.name },
    });
    if (exists) {
      throw new AppError({ message: "An income source with this name already exists" });
    }
    await db.insert(incomeSources).values(data.formData);
    return createSuccessResponse({ message: "Income source created" });
  });

export function createIncomeSourceMutationOptions() {
  return mutationOptions({
    mutationFn: appMutationFn((input) => createIncomeSourceServerFn({ data: input })),
    onSuccess: async (...args) => {
      // Prefix — list query keys include input variants (e.g. { month })
      await args[3].client.invalidateQueries({ queryKey: ["income", "list"] });
    },
  });
}
```

Extract `src/features/income/lib/` helpers **only when** the same logic is reused across multiple query/mutation modules — not by default.

**Non-form mutation:** use a flat input schema (no `formData` wrapper) when the action is not tied to a form schema.

---

## 3. Route — page + loader prefetch + subscribe

**Page route:** `src/routes/app/incomes/index.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { incomeListQueryOptions } from "#/features/income/queries/income-list-query-options";
import { IncomeList } from "./-lib/income-list";

export const Route = createFileRoute("/app/incomes/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(incomeListQueryOptions({})), // no month filter — see §6 for search-driven input
  component: IncomesPage,
});

function IncomesPage() {
  const { data: items } = useSuspenseQuery(incomeListQueryOptions({}));

  return (
    <main>
      <h1>Income sources</h1>
      <IncomeList items={items} />
    </main>
  );
}
```

**Critical — loader vs hook**

- `loader` → `ensureQueryData` **starts** the fetch; it is **not** a subscriber.
- `useSuspenseQuery(incomeListQueryOptions(input))` → **live** cache subscription; stays fresh after `invalidateOnSuccess`.
- **Never** render list data from `Route.useLoaderData()` for query-backed UI.

TanStack Start wraps routes in Suspense by default, so primary `useSuspenseQuery` usage works without adding a local boundary. Skeleton pending UI is planned later.

**Optional route hook:** `src/routes/app/incomes/-lib/use-income-list.ts`

```ts
import { useSuspenseQuery } from "@tanstack/react-query";
import { incomeListQueryOptions } from "#/features/income/queries/income-list-query-options";

export function useIncomeList(input: IncomeListInput) {
  return useSuspenseQuery(incomeListQueryOptions(input));
}
```

Use when the page composes multiple child components that share the same subscription.

---

## 4. Secondary data — `useQuery` (edit panel)

Data the user does not need to see immediately (e.g. one income source for an edit drawer) uses **`useQuery`**, not suspense, with local pending/error UI:

```tsx
import { useQuery } from "@tanstack/react-query";
import { incomeSourceQueryOptions } from "#/features/income/queries/income-source-query-options";

function EditIncomeSourcePanel({ id }: { id: string }) {
  const { data, isPending, isError } = useQuery(incomeSourceQueryOptions(id));

  if (isPending) return <p>Loading…</p>;
  if (isError) return <p>Could not load income source.</p>;

  return <EditIncomeSourceForm initial={data} />;
}
```

Define `income-source-query-options.ts` the same way as the list query — private GET serverFn, RPC-shaped `data`, `appQueryFn` in the factory.

---

## 5. Form in route `-lib`

**File:** `src/routes/app/incomes/-lib/create-income-source-form.tsx`

```tsx
import { useMutation } from "@tanstack/react-query";
import { createIncomeSourceMutationOptions } from "#/features/income/mutations/create-income-source-mutation-options";
import {
  type CreateIncomeSourceFormValues,
  createIncomeSourceFormSchema,
} from "#/features/income/schemas/create-income-source-form-schema";
import { useAppForm } from "#/lib/form/create-app-form";

function useCreateIncomeSourceFormDefaultValues() {
  return { name: "" } satisfies CreateIncomeSourceFormValues as CreateIncomeSourceFormValues;
}

export function CreateIncomeSourceForm() {
  const mutation = useMutation(createIncomeSourceMutationOptions());
  const defaultValues = useCreateIncomeSourceFormDefaultValues();

  const form = useAppForm({
    defaultValues,
    validators: { onChange: createIncomeSourceFormSchema },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({ formData: value });
      form.reset();
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); void form.handleSubmit(); }}>
      <form.AppField name="name">
        {(field) => <field.TextInput />}
      </form.AppField>
      {/* SubmitButton pattern — see ADR-0001 follow-up */}
    </form>
  );
}
```

- Client validation → form schema on `useAppForm`.
- Server/business failures → thrown `AppError` → toast via `appMutationFn`; no inline server error state.
- If `mutateAsync` throws, code after it (e.g. `navigate`) does not run.

---

## 6. Search params (when needed)

Define the search schema on the route file with `zodValidator` (the **only** place we use `zodValidator`). Wire search into the loader via **`loaderDeps`** — `validateSearch` already parsed search; do not re-parse in the loader.

Map search fields to the query factory's **`IncomeListInput`** so loader, hook, and serverFn stay aligned:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { incomeListQueryOptions } from "#/features/income/queries/income-list-query-options";

const incomesSearchSchema = z.object({
  month: z.string().optional(),
});

export const Route = createFileRoute("/app/incomes/")({
  validateSearch: zodValidator(incomesSearchSchema),
  loaderDeps: ({ search: { month } }) => ({ month }),
  loader: ({ context: { queryClient }, deps }) =>
    queryClient.ensureQueryData(incomeListQueryOptions(deps)),
  component: IncomesPage,
});

function IncomesPage() {
  const { month } = Route.useSearch();
  const { data: items } = useSuspenseQuery(incomeListQueryOptions({ month }));

  return (/* … */);
}
```

`loaderDeps` declares which search fields trigger a loader re-run; `deps` in the loader is already typed from validated search — no `schema.parse(location.search)`.

---

## Auth comparison (live code)

| Concern | Domain (this guide) | Auth ([`auth-patterns.md`](./auth-patterns.md)) |
|---------|----------------------|--------------------------------------------------|
| Server boundary | `createServerFn` | `authClient` for login/signup/logout |
| Session read | — | `sessionQueryOptions` + private GET serverFn |
| Mutation wrappers | `appMutationFn` | Same |
| Form input shape | `{ formData: formSchema }` | Same |
| Invalidation | `invalidateOnSuccess(..., queryOptions().queryKey)` | Invalidates `sessionQueryOptions().queryKey` |
| Route guards | — | Layout `useAuth()` in `_auth` / `app` route groups |

---

## Checklist

- [ ] Feature files export factories/schemas only; serverFns are module-private
- [ ] Filename stem matches exported factory name
- [ ] No-input serverFns: omit `.inputValidator`; factory has no input param (see `sessionQueryOptions`)
- [ ] With-input serverFns: schema + inferred type; same object drives `queryKey` and `serverFn({ data })`
- [ ] Form mutations: `formData` wrapper only when tied to a form schema
- [ ] Success via `createSuccessResponse`; failures via thrown `AppError`
- [ ] `appQueryFn` / `appMutationFn` on all domain option factories
- [ ] Route at `.../page-name/index.tsx`; forms/helpers in `-lib/`
- [ ] Loader uses `ensureQueryData` only; page subscribes with `useSuspenseQuery` / `useQuery`
- [ ] Never render query-backed UI from `useLoaderData`
- [ ] This guide and ADR-0003 updated if contracts changed

## What not to do

- Do not shape GET responses like REST collections “just in case” — return what the UI context needs.
- Do not export `createServerFn` handlers from feature modules.
- Do not duplicate query keys for invalidation — use `someQueryOptions(input).queryKey` or a shared prefix when multiple inputs exist.
- Do not re-parse search in loaders — use `loaderDeps` + validated `deps`.
- Do not use `zodValidator` on serverFn `.inputValidator` — route `validateSearch` only.
- Do not use `z.object({})` or `{}` to fake a no-input serverFn — omit `.inputValidator` instead (see `sessionQueryOptions`).
- Do not treat loader output as invalidation-safe data.
- Do not add inline server error banners — toast via `AppError` and let the user retry.
- Do not call `authClient` from routes — use auth mutation factories ([ADR-0002](../adr/0002-auth-boundary-and-route-guards.md)).
