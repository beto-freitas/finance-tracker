# Adding a form field type

How to create and register a new input control for `useAppForm`. Architectural rationale is in [ADR-0001](../adr/0001-form-input-architecture.md).

## Keeping this guide current

When you add or change a field type, registration flow, addon contract, or wrapper contract, update **this guide** in the same PR. If the change alters an architectural decision (layering, validation, labels, errors, addons, bar styling), update [ADR-0001](../adr/0001-form-input-architecture.md) too. Code and docs should land together — do not merge definition changes and leave docs for later.

## Prerequisites

- Form hook: `src/lib/form/create-app-form.ts`
- Wrapper: `src/lib/form/field-input-wrapper.tsx` (`FieldControlProps`, `fieldInputWrapper`)
- Visual shell: `src/components/form/base-field.tsx`
- Shared styling: `src/components/form/control-variants.ts` (`controlShellVariants`, `controlInnerVariants`)
- Internal string primitive: `src/components/form/string-input.tsx` (`@internal`)
- Addon contract: `src/components/form/input-addon.tsx` (`InputAddon`, `InputAddonSlot`, `renderInputAddon`)
- Bar primitives: `src/components/ui/input.tsx`, `src/components/ui/input-group.tsx`
- Icon alias: `src/types/icon.ts` (`Icon = LucideIcon`)
- Reference implementations: `src/components/form/text-input.tsx`, `src/components/form/password-input.tsx`
- Live usage: `src/routes/_auth/login/-lib/login-form.tsx`

## Recipe

### 1. Implement a dumb control

Create `src/components/form/<name>-input.tsx`. The control:

- Accepts `FieldControlProps<TValue>` plus any extra props (placeholder, autoComplete, disabled, …).
- Does **not** import TanStack Form or `useFieldContext`.
- Bridges native DOM events to `(value: TValue) => void`.
- For string values, **delegates to `StringInput`** (it owns bare-`Input` vs `InputGroup` branching, addon rendering, and chrome). For other value shapes (`number`, `Date`, …), compose `controlShellVariants` / `controlInnerVariants` directly or wrap the relevant shadcn primitive.

Example — `TextInput` (`TValue = string`), reusing the internal primitive:

```tsx
import type * as React from "react";

import type { InputAddonSlot } from "#/components/form/input-addon.tsx";
import { StringInput } from "#/components/form/string-input.tsx";
import type { FieldControlProps } from "#/lib/form/field-input-wrapper.tsx";

export type TextInputProps = FieldControlProps<string> &
  Omit<
    React.ComponentProps<"input">,
    "value" | "onChange" | "onBlur" | "name" | "id" | "aria-invalid" | "type"
  > & {
    leftAddon?: InputAddonSlot;
    rightAddon?: InputAddonSlot;
  };

export function TextInput(props: TextInputProps) {
  return <StringInput type="text" {...props} />;
}
```

For `NumberInput` (or other non-string controls), change `TValue` and the bridge logic accordingly, and apply `controlShellVariants()` / `controlInnerVariants()` directly.

### 2. Wrap and register

In `src/lib/form/create-app-form.ts`:

```tsx
import { PasswordInput } from "#/components/form/password-input.tsx";
import { TextInput } from "#/components/form/text-input.tsx";

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
  defaultValues: { email: "", password: "" },
  validators: { onChange: schema, onSubmit: schema },
});

<form.AppField name="email">
  {(field) => <field.TextInput autoComplete="email" />}
</form.AppField>

<form.AppField name="password">
  {(field) => (
    <field.PasswordInput
      autoComplete="current-password"
      // leftAddon is allowed; rightAddon is owned by the eye toggle.
    />
  )}
</form.AppField>
```

Field names drive default labels (`password` → "Password", `balanceMinor` → "Balance Minor"). Override with `label`, or pass `hideLabel` for visually hidden labels.

### 4. Validate at form level

Keep Zod on `useAppForm`, not on the control:

```tsx
const schema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});
```

## Input addons

Use addons to put icons, buttons, or static text inside the input bar. Prefer the structured `InputAddon` variants over raw `ReactNode` so styling stays consistent.

```tsx
import { Search } from "lucide-react";

// Decorative search icon (left)
<field.TextInput
  leftAddon={{ variant: "icon", icon: Search }}
  placeholder="Search transactions…"
/>

// Currency suffix (text)
<field.TextInput
  leftAddon={{ variant: "text", children: "$" }}
  rightAddon={{ variant: "text", children: "USD" }}
/>

// Clickable action — MUST use variant: "action" (ariaLabel required)
<field.TextInput
  rightAddon={{
    variant: "action",
    icon: Eraser,
    ariaLabel: "Clear",
    onClick: () => form.setFieldValue("query", ""),
  }}
/>

// Escape hatch — ReactNode for one-offs (not for buttons)
<field.TextInput
  rightAddon={<span className="text-xs tabular-nums">{count}/280</span>}
/>
```

### Variant cheatsheet

| Variant | Use for | Renders as |
|---------|---------|------------|
| `action` | Clickable affordance (password eye, clear, custom caret) | `InputGroupButton` (icon-only) |
| `icon` | Decorative adornment (search magnifier, status indicator) | bare `<Icon aria-hidden />` |
| `text` | Static prefix/suffix ("$", "USD", "@company.com") | `InputGroupText` |
| `ReactNode` | True one-offs only — flags, badges, composed layouts | as-is |

### Slot ownership per control

- `TextInput` — both `leftAddon` and `rightAddon` open
- `PasswordInput` — `leftAddon` open; `rightAddon` **owned by the internal eye toggle** (not exposed). Need a custom right slot? Use `TextInput` + manual addons.
- Future `SelectInput` — `leftAddon` open; `rightAddon` defaults to a chevron `action` and is overridable.

## Checklist

- [ ] Control implements `FieldControlProps<TValue>` and stays free of TanStack imports
- [ ] String controls delegate to `StringInput`; other shapes compose `controlShellVariants` / `controlInnerVariants`
- [ ] Wrapped with `fieldInputWrapper` and registered in `fieldComponents`
- [ ] Form-level schema covers the field; no schema metadata used for labels
- [ ] Addon buttons use `variant: "action"` (with `ariaLabel`), not raw `ReactNode`
- [ ] Slot ownership is explicit — omit a slot from public props when the control owns it (e.g. `PasswordInput.rightAddon`)
- [ ] This guide updated if steps or contracts changed
- [ ] ADR-0001 updated if an architectural decision changed

## What not to do

- Do not put TanStack field logic inside the control — that belongs in `fieldInputWrapper`.
- Do not add `type="password"` / `type="email"` as props on `TextInput`; create a dedicated component.
- Do not branch on `leftAddon` / `rightAddon` inside each string control — let `StringInput` own that.
- Do not render an `InputGroupButton` inside a raw `ReactNode` addon when `variant: "action"` would do; raw nodes bypass shared button styling.
- Do not add form UI how-tos to `CONTEXT.md` — that file is domain glossary only.
