# Feature end-to-end (serverFn → page)

How to add a domain query, mutation, and route using the patterns in [ADR-0003](../adr/0003-server-functions-and-data-fetching.md).

**Live reference:** `src/features/cash-accounts/` and `src/routes/app/cash-accounts/`. Auth differs where it calls `authClient` instead of `createServerFn` ([ADR-0002](../adr/0002-auth-boundary-and-route-guards.md), [`auth-patterns.md`](./auth-patterns.md)).

Import paths: [`project-layout.md`](./project-layout.md). Database tables: [ADR-0004](../adr/0004-database-schema-layout.md).

## Keep this guide current

When you add or change query/mutation factories, loader prefetch rules, route `-lib` conventions, overlay patterns, or the serverFn envelope contract, update **this guide** in the same PR. If overlays change, also update [`overlays.md`](./overlays.md). If the change alters an architectural decision, update [ADR-0003](../adr/0003-server-functions-and-data-fetching.md) too. Code and docs should land together.

## Prerequisites

- Envelope helpers: `src/lib/server-fn/create-success-response.ts`, `src/lib/errors/app-error.ts`
- Auth: `src/lib/server-fn/auth-middleware.ts`, `src/lib/errors/app-unauthenticated-error.ts`
- Query wrappers: `src/lib/query/app-query-fn.ts`, `src/lib/query/app-mutation-fn.ts`, `src/lib/query/invalidate-on-success.ts`
- RPC typing: `src/lib/server-fn/response-data.ts` (`AppServerFnResult`)
- Forms: [ADR-0001](../adr/0001-form-input-architecture.md), [`adding-form-fields.md`](./adding-form-fields.md)
- Session query (unauthenticated): `src/features/auth/queries/session-query-options.ts`

## Feature module checklist

| Path | Exports | Stays private |
|------|---------|---------------|
| `queries/cash-account-list-query-options.ts` | `cashAccountListQueryOptions()`, `CashAccountListItem` | `getCashAccountListServerFn` |
| `mutations/create-cash-account-mutation-options.ts` | `createCashAccountMutationOptions()` | `createCashAccountServerFn` |
| `mutations/update-cash-account-mutation-options.ts` | `updateCashAccountMutationOptions()` | `updateCashAccountServerFn` |
| `schemas/create-cash-account-form-schema.ts` | `createCashAccountFormSchema`, `CreateCashAccountFormValues` | — |
| `lib/cash-account-errors.ts` | `ExistingCashAccountError`, … | — |
| `lib/get-first-cash-account.ts` | `getFirstCashAccount` | — |

**Rule:** filename stem matches the exported symbol (`cash-account-list-query-options.ts` → `cashAccountListQueryOptions`).

---

## 1. Query — list data (GET serverFn)

When the serverFn needs **no client input**, omit `.inputValidator`. Apply **`authMiddleware`** when the data belongs to the authenticated user.

**File:** `src/features/cash-accounts/queries/cash-account-list-query-options.ts`

Returns **only what the list UI needs** (RPC shape — not a REST “full row”). Convert persisted values at the handler boundary (see [Persistence conventions](#persistence-conventions)).

```ts
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { db } from "#/db";
import { fromMinorUnits } from "#/lib/currency/minor-units";
import { appQueryFn } from "#/lib/query/app-query-fn";
import { authMiddleware } from "#/lib/server-fn/auth-middleware";
import { createSuccessResponse } from "#/lib/server-fn/create-success-response";
import type { AppServerFnResult } from "#/lib/server-fn/response-data";

const getCashAccountListServerFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }) => {
    const rows = await db.query.cashAccount.findMany({
      where: { userId: user.id },
      columns: { id: true, name: true, balanceMinor: true, balanceAsOfDate: true },
      orderBy: { createdAt: "asc" },
    });

    return createSuccessResponse({
      data: rows.map((row) => ({
        id: row.id,
        name: row.name,
        balanceMajor: fromMinorUnits(row.balanceMinor),
        balanceAsOfDate: row.balanceAsOfDate,
      })),
    });
  });

export type CashAccountListItem = AppServerFnResult<
  typeof getCashAccountListServerFn
>[number];

export function cashAccountListQueryOptions() {
  return queryOptions({
    queryKey: ["cash-accounts", "list"],
    queryFn: appQueryFn(getCashAccountListServerFn),
  });
}
```

**Notes**

- Derive list item types with `AppServerFnResult<typeof getXServerFn>[number]` — do not maintain a separate manual RPC type.
- Pass the serverFn directly to `appQueryFn(getXServerFn)` for no-input GETs.
- No `message` on success → no success toast.
- Throw feature error subclasses or `AppError` for expected failures; `appQueryFn` toasts the message.
- Empty list `[]` is a normal state — not an error.
- **`zodValidator`** is for route `validateSearch` only — serverFns use `.inputValidator(zodSchema)` directly.

---

## 2. Mutation — form submit (POST serverFn)

**Schema:** `src/features/cash-accounts/schemas/create-cash-account-form-schema.ts`

Form fields use **client naming** (`balanceMajor`). DB columns use **server naming** (`balanceMinor`).

```ts
import { z } from "zod";

export const createCashAccountFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
  balanceMajor: z.number({ error: "Balance must be a number" }).min(0, "Balance must be zero or greater"),
  balanceAsOfDate: z.iso.date("Date must be in YYYY-MM-DD format"),
});

export type CreateCashAccountFormValues = z.infer<typeof createCashAccountFormSchema>;
```

**Errors:** `src/features/cash-accounts/lib/cash-account-errors.ts`

```ts
import { AppError } from "#/lib/errors/app-error";

export class ExistingCashAccountError extends AppError {
  constructor() {
    super({ message: "You already have a cash account" });
  }
}
```

**Mutation module:** `src/features/cash-accounts/mutations/create-cash-account-mutation-options.ts`

```ts
import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "#/db";
import { cashAccount } from "#/db/schemas";
import { toMinorUnits } from "#/lib/currency/minor-units";
import { appMutationFn } from "#/lib/query/app-mutation-fn";
import { invalidateOnSuccess } from "#/lib/query/invalidate-on-success";
import { authMiddleware } from "#/lib/server-fn/auth-middleware";
import { createSuccessResponse } from "#/lib/server-fn/create-success-response";
import { ExistingCashAccountError } from "../lib/cash-account-errors";
import { getFirstCashAccount } from "../lib/get-first-cash-account";
import { cashAccountListQueryOptions } from "../queries/cash-account-list-query-options";
import { createCashAccountFormSchema } from "../schemas/create-cash-account-form-schema";

const createCashAccountMutationInputSchema = z.object({
  formData: createCashAccountFormSchema,
});

const createCashAccountServerFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(createCashAccountMutationInputSchema)
  .handler(async ({ data, context: { user } }) => {
    if (await getFirstCashAccount(user.id)) {
      throw new ExistingCashAccountError();
    }

    await db.insert(cashAccount).values({
      userId: user.id,
      name: data.formData.name,
      balanceMinor: toMinorUnits(data.formData.balanceMajor),
      balanceAsOfDate: data.formData.balanceAsOfDate,
    });

    return createSuccessResponse({ message: "Cash account created" });
  });

export function createCashAccountMutationOptions() {
  return mutationOptions({
    mutationFn: appMutationFn(createCashAccountServerFn),
    onSuccess: async (...args) => {
      await invalidateOnSuccess(args, cashAccountListQueryOptions().queryKey);
    },
  });
}
```

- Pass the serverFn **directly** to `appMutationFn` — no wrapper function unless pre-RPC client logic is needed.
- Do **not** set `mutationKey` — invalidate via `invalidateOnSuccess` only.
- Update mutations follow the same pattern with `{ cashAccountId, formData }` input.

Extract `src/features/{feature}/lib/` helpers **only when** reused across multiple query/mutation modules.

**Non-form mutation:** use a flat input schema (no `formData` wrapper) when the action is not tied to a form schema.

---

## 3. Route — page + loader prefetch + subscribe

**Page route:** `src/routes/app/cash-accounts/index.tsx`

```tsx
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { cashAccountListQueryOptions } from "#/features/cash-accounts/queries/cash-account-list-query-options";

export const Route = createFileRoute("/app/cash-accounts/")({
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(cashAccountListQueryOptions());
  },
  component: CashAccountsPage,
});

function CashAccountsPage() {
  const { data: cashAccounts } = useSuspenseQuery(cashAccountListQueryOptions());
  // render list from cashAccounts …
}
```

**Critical — loader vs hook**

- `loader` → `ensureQueryData` **starts** the fetch; it is **not** a subscriber.
- `useSuspenseQuery(cashAccountListQueryOptions())` → **live** cache subscription; stays fresh after `invalidateOnSuccess`.
- **Never** render list data from `Route.useLoaderData()` for query-backed UI.

The `/app` layout wraps the outlet in `<Suspense>` with a default spinner — primary `useSuspenseQuery` usage shows that fallback while page data loads. See [ADR-0003 § Layout-level pending UI](../adr/0003-server-functions-and-data-fetching.md#layout-level-pending-ui). Add per-route `pendingComponent` only when `useSuspenseQuery` is not the right fit.

---

## 4. Secondary data — `useQuery` (edit panel)

Data the user does not need to see immediately uses **`useQuery`**, not suspense, with local pending/error UI:

```tsx
import { useQuery } from "@tanstack/react-query";
import { cashAccountQueryOptions } from "#/features/cash-accounts/queries/cash-account-query-options";

function EditCashAccountPanel({ id }: { id: string }) {
  const { data, isPending, isError } = useQuery(cashAccountQueryOptions(id));

  if (isPending) return <p>Loading…</p>;
  if (isError) return <p>Could not load cash account.</p>;

  return <EditCashAccountForm editData={data} />;
}
```

Define detail query modules the same way as the list query — private GET serverFn, `authMiddleware`, RPC-shaped `data`, `appQueryFn` in the factory.

---

## 5. Form in route `-lib`

**File:** `src/routes/app/cash-accounts/-lib/create-cash-account-form.tsx`

```tsx
import { useMutation } from "@tanstack/react-query";
import { createCashAccountMutationOptions } from "#/features/cash-accounts/mutations/create-cash-account-mutation-options";
import {
  type CreateCashAccountFormValues,
  createCashAccountFormSchema,
} from "#/features/cash-accounts/schemas/create-cash-account-form-schema";
import { todayIsoDate } from "#/lib/date/iso-date";
import { useAppForm } from "#/lib/form/create-app-form";

function useCreateCashAccountFormDefaultValues() {
  return {
    name: "",
    balanceMajor: undefined as unknown as number,
    balanceAsOfDate: todayIsoDate(),
  } satisfies CreateCashAccountFormValues as CreateCashAccountFormValues;
}

export function CreateCashAccountForm() {
  const mutation = useMutation(createCashAccountMutationOptions());
  const defaultValues = useCreateCashAccountFormDefaultValues();

  const form = useAppForm({
    defaultValues,
    validators: { onChange: createCashAccountFormSchema },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({ data: { formData: value } });
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); void form.handleSubmit(); }}>
      <form.AppField name="name">
        {(field) => <field.TextInput />}
      </form.AppField>
      <form.AppField name="balanceMajor">
        {(field) => <field.CurrencyInput label="Balance" currency="BRL" />}
      </form.AppField>
      <form.AppField name="balanceAsOfDate">
        {(field) => <field.DateInput label="Balance as of date" />}
      </form.AppField>
    </form>
  );
}
```

- Client validation → form schema on `useAppForm` with **`onChange` only**.
- Empty required numbers → `undefined as unknown as number` in default values (see [`adding-form-fields.md`](./adding-form-fields.md)).
- Domain mutation call shape → `mutateAsync({ data: { formData: value } })`.
- Server/business failures → thrown errors → toast via `appMutationFn`; no inline server error state.

---

## 6. Search params (when needed)

Define the search schema on the route file with `zodValidator` (the **only** place we use `zodValidator`). Wire search into the loader via **`loaderDeps`**.

```tsx
export const Route = createFileRoute("/app/example/")({
  validateSearch: zodValidator(searchSchema),
  loaderDeps: ({ search: { month } }) => ({ month }),
  loader: ({ context: { queryClient }, deps }) =>
    queryClient.ensureQueryData(exampleListQueryOptions(deps)),
  component: ExamplePage,
});
```

`loaderDeps` declares which search fields trigger a loader re-run; `deps` in the loader is already typed from validated search.

---

## Auth comparison (live code)

| Concern | Domain (this guide) | Auth ([`auth-patterns.md`](./auth-patterns.md)) |
|---------|----------------------|--------------------------------------------------|
| Server boundary | `createServerFn` + `authMiddleware` | `authClient` for login/signup/logout |
| Session read | — | `sessionQueryOptions` (no middleware) |
| Mutation wiring | `appMutationFn(serverFn)` direct | Thin wrapper + `authClient` |
| Form call shape | `mutateAsync({ data: { formData } })` | `mutateAsync({ formData })` |
| Invalidation | `invalidateOnSuccess(..., queryOptions().queryKey)` | Invalidates `sessionQueryOptions().queryKey` |
| Route guards | — | Layout `useAuth()` in `_auth` / `app` route groups |

---

## Persistence conventions

### Money — `balanceMajor` / `balanceMinor`

| Layer | Field | Units | Example |
|-------|-------|-------|---------|
| Form schema / RPC | `balanceMajor` | major (what user types) | `1500.00` |
| DB / Drizzle | `balanceMinor` | integer minor units | `150000` |

- **Client never sees minor units** — list/detail RPCs return `balanceMajor`.
- **Conversion only** in `src/lib/currency/minor-units.ts`:
  - `toMinorUnits(major)` — mutation handlers before write
  - `fromMinorUnits(minor)` — query handlers before `createSuccessResponse`
- **Never scatter `* 100` or `/ 100`** outside that module.
- v1 assumes 2-decimal currencies (BRL/USD). Comment in `minor-units.ts` when extending.
- `formatCurrency(amountMajor, …)` in `src/lib/currency/format-currency.ts` takes **major** units.
- Forms use `field.CurrencyInput` with `balanceMajor` — user enters `1500.00`, not `150000`.

**MAYBE follow-up:** generic mapper over `{ balanceMinor }` objects/arrays with inferred `{ balanceMajor }` return when many handlers repeat the same map.

### Dates — ISO `YYYY-MM-DD`

- Store and transport calendar dates as ISO date strings (`YYYY-MM-DD`) — never full datetimes for persisted dates.
- `toIsoDate(date)` → `date.toISOString().slice(0, 10)` in `src/lib/date/iso-date.ts`
- `todayIsoDate()` → `toIsoDate(new Date())`
- Do not use raw `new Date().toISOString()` for form defaults or DB values.

---

## Checklist

- [ ] Feature files export factories/schemas only; serverFns are module-private
- [ ] Filename stem matches exported factory name
- [ ] Protected serverFns use `.middleware([authMiddleware])`
- [ ] No-input serverFns: omit `.inputValidator`; pass serverFn directly to `appQueryFn`
- [ ] Domain mutations: `appMutationFn(serverFn)` direct; no `mutationKey`
- [ ] Form mutations: `mutateAsync({ data: { formData } })`; auth uses `{ formData }` only
- [ ] RPC types via `AppServerFnResult<typeof getXServerFn>`
- [ ] Money converted at serverFn boundary only (`toMinorUnits` / `fromMinorUnits`)
- [ ] Success via `createSuccessResponse`; failures via thrown `AppError` subclasses or inline `AppError`
- [ ] Route at `.../page-name/index.tsx`; forms/helpers in `-lib/`
- [ ] Loader uses `ensureQueryData` only; page subscribes with `useSuspenseQuery` / `useQuery`
- [ ] Never render query-backed UI from `useLoaderData`
- [ ] This guide and ADR-0003 updated if contracts changed

## Overlays (sheet / dialog)

URL-driven sheets and dialogs on a route (e.g. `/app/income`) are documented in [`overlays.md`](./overlays.md). Income settlement platforms are the reference implementation under `src/routes/app/income/-lib/`.

## What not to do

- Do not shape GET responses like REST collections “just in case” — return what the UI context needs.
- Do not export `createServerFn` handlers from feature modules.
- Do not skip `authMiddleware` on protected serverFns because layout guards exist.
- Do not duplicate query keys for invalidation — use `someQueryOptions().queryKey`.
- Do not scatter money `×100` / `÷100` outside `minor-units.ts` — use `basis-points.ts` and `exchange-rate-minor.ts` for spread and FX base rate storage (2dp).
- Do not use `zodValidator` on serverFn `.inputValidator` — route `validateSearch` only.
- Do not use `z.object({})` or `{}` to fake a no-input serverFn — omit `.inputValidator` instead.
- Do not treat loader output as invalidation-safe data.
- Do not add inline server error banners — toast via thrown errors.
- Do not call `authClient` from routes — use auth mutation factories ([ADR-0002](../adr/0002-auth-boundary-and-route-guards.md)).
- Do not run `tools/clear-db.ts` from agents — dev-only, human decision ([ADR-0004](../adr/0004-database-schema-layout.md)).
