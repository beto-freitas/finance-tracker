# Adding a form field type

How to create and register a new input control for `useAppForm`. Architectural rationale is in [ADR-0001](../adr/0001-form-input-architecture.md).

## Keeping this guide current

When you add or change a field type, registration flow, or wrapper contract, update **this guide** in the same PR. If the change alters an architectural decision (layering, validation, labels, errors), update [ADR-0001](../adr/0001-form-input-architecture.md) too. Code and docs should land together — do not merge definition changes and leave docs for later.

## Prerequisites

- Form hook: `src/lib/form/create-app-form.ts`
- Wrapper: `src/lib/form/field-input-wrapper.tsx` (`FieldControlProps`, `fieldInputWrapper`)
- Visual shell: `src/components/form/base-field.tsx`
- Shared styling: `src/components/form/control-variants.ts`
- Reference implementation: `src/components/form/text-input.tsx`
- Live usage: `src/routes/login.tsx`

## Recipe

### 1. Implement a dumb control

Create `src/components/form/<name>-input.tsx`. The control:

- Accepts `FieldControlProps<TValue>` plus any extra props (placeholder, autoComplete, disabled, …).
- Does **not** import TanStack Form or `useFieldContext`.
- Bridges native DOM events to `(value: TValue) => void`.
- Uses `controlVariants` (usually via shadcn `Input`) for consistent chrome.

Example — `PasswordInput` (`TValue = string`):

```tsx
import type * as React from "react";

import { Input } from "#/components/ui/input.tsx";
import type { FieldControlProps } from "#/lib/form/field-input-wrapper.tsx";

export type PasswordInputProps = FieldControlProps<string> &
  Omit<
    React.ComponentProps<"input">,
    "value" | "onChange" | "onBlur" | "name" | "id" | "aria-invalid" | "type"
  >;

export function PasswordInput({ value, onChange, onBlur, ...rest }: PasswordInputProps) {
  return (
    <Input
      type="password"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      {...rest}
    />
  );
}
```

For non-string values (e.g. `NumberInput`), change `TValue` and the bridge logic accordingly.

### 2. Wrap and register

In `src/lib/form/create-app-form.ts`:

```tsx
import { PasswordInput } from "#/components/form/password-input.tsx";

export const { useAppForm, withForm } = createFormHook({
  // ...
  fieldComponents: {
    TextInput: fieldInputWrapper(TextInput),
    PasswordInput: fieldInputWrapper(PasswordInput),
  },
});
```

The wrapper handles TanStack binding, heuristic label, error visibility, and `BaseField` markup. You do not repeat that in the control.

### 3. Use in a route

```tsx
const form = useAppForm({
  defaultValues: { password: "" },
  validators: { onChange: schema, onSubmit: schema },
});

<form.AppField name="password">
  {(field) => (
    <field.PasswordInput
      autoComplete="current-password"
      label="Password"           // optional; default from field name
      description="At least 8 characters"  // optional
    />
  )}
</form.AppField>
```

Field names drive default labels (`password` → "Password", `balanceMinor` → "Balance Minor"). Override with `label`, or pass `hideLabel` for visually hidden labels.

### 4. Validate at form level

Keep Zod on `useAppForm`, not on the control:

```tsx
const schema = z.object({
  password: z.string().min(8, "At least 8 characters"),
});
```

## Checklist

- [ ] Control implements `FieldControlProps<TValue>` and stays free of TanStack imports
- [ ] Control uses shared input chrome (`Input` + `controlVariants`, or `controlVariants` directly)
- [ ] Wrapped with `fieldInputWrapper` and registered in `fieldComponents`
- [ ] Form-level schema covers the field; no schema metadata used for labels
- [ ] This guide updated if steps or contracts changed
- [ ] ADR-0001 updated if an architectural decision changed

## What not to do

- Do not put TanStack field logic inside the control — that belongs in `fieldInputWrapper`.
- Do not add `type="password"` / `type="email"` as props on `TextInput`; create a dedicated component.
- Do not add form UI how-tos to `CONTEXT.md` — that file is domain glossary only.
