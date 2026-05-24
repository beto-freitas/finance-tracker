# Form input architecture

Forms use TanStack Form with a three-layer stack: `useAppForm` registers field components; `fieldInputWrapper` binds TanStack field state to a dumb control and renders the shared `BaseField` shell; each control (e.g. `TextInput`) only bridges native events to a typed value. Validation is a form-level Zod schema (Standard Schema); labels are derived from field names unless overridden; errors show once a field is touched or submit has been attempted.

Inline affordances inside a control (search icon, password eye, select chevron, currency suffix) compose through a single `InputAddon` contract and the `InputGroup` shell, so every "bar" stays visually identical whether it has addons or not.

**Guide:** step-by-step instructions for adding a new field type live in [`docs/guides/adding-form-fields.md`](../guides/adding-form-fields.md).

## Layering

```
useAppForm / form.AppField
  → field.TextInput | field.PasswordInput   (registered in create-app-form.ts)
    → fieldInputWrapper(...)                TanStack binding + label/error wiring
      → BaseField.*                         visual shell (label, description, error)
        → TextInput | PasswordInput         dumb control; bridges DOM → typed value
          → StringInput                     @internal layout primitive (Only needed for String-like inputs - Email, Text, Password etc)
            → Input | InputGroup            bar shell (bare or grouped)
              → InputAddon variants         action / icon / text / ReactNode
```

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Form hook | `src/lib/form/create-app-form.ts` | `useAppForm`, `withForm`; `fieldComponents` registry |
| TanStack contexts | `src/lib/form/contexts.ts` | `useFieldContext`, `useFormContext` |
| Field wrapper | `src/lib/form/field-input-wrapper.tsx` | Binds field state; derives label; shows errors; renders `BaseField` |
| Visual shell | `src/components/form/base-field.tsx` | Compound `BaseField.*` — no TanStack knowledge |
| Public control | `src/components/form/<name>-input.tsx` | Dumb component; implements `FieldControlProps<TValue>` |
| Internal layout primitive | `src/components/form/string-input.tsx` | `@internal` — bare-`Input` vs `InputGroup` branching for string-like controls |
| Addon contract | `src/components/form/input-addon.tsx` | `InputAddon` discriminated union + `renderInputAddon` |
| Shared chrome | `src/components/form/control-variants.ts` | `controlShellVariants` (bar) + `controlInnerVariants` (text) |
| Bar primitives | `src/components/ui/input.tsx`, `src/components/ui/input-group.tsx` | Bare `<Input>` and the grouped `InputGroup` shell |
| Icon alias | `src/types/icon.ts` | `Icon = LucideIcon` — swap libraries in one place |

**Rejected alternative:** a single smart field component that owns both TanStack wiring and rendering. Splitting wrapper (binding) from control (value bridging) from shell (markup) keeps new input types small and testable.

**Rejected alternative:** `type="password" | "email"` props on `TextInput`. Each value-shape × semantic combination is its own registered component, so routes get autocomplete and per-type behaviour (e.g. the password eye toggle) lives with the control it belongs to.

## Validation

- Schema lives on `useAppForm` via `validators` (e.g. `{ onChange: schema }`).
- Zod satisfies TanStack's Standard Schema adapter — no per-field schema registration.
- Labels are **not** read from schema metadata; use the `label` prop or the field-name heuristic.

## Labels

- Default: `fieldNameToLabel(field.name)` — camelCase, snake_case, kebab-case, and dotted paths → Title Case (last segment for nested paths).
- Overrides on any wrapped field: `label`, `description`, `hideLabel` (visually hidden, still accessible).

## Error visibility

A field shows validation errors when **either**:

1. the field has been touched (`isTouched`), or
2. the form has at least one submit attempt (`submissionAttempts > 0`).

Errors are normalized from Standard Schema issues, plain strings, or mixed slots into `{ message }[]` for shadcn's `FieldError`.

## Control conventions

- Each control type owns one value shape (`string` for `TextInput` / `PasswordInput`, `number` for a future `NumberInput`, etc.).
- `TextInput` is `type="text"` only — password, email, and number are separate registered components, not props on `TextInput`.
- New controls reuse `controlShellVariants` (the bar) and `controlInnerVariants` (the text) so every "bar" looks identical whether bare or grouped.
- String-valued controls delegate layout to the `@internal` `StringInput` primitive instead of branching on addons themselves.

## Input addons

Inline addon slots — left or right of the input — use a single discriminated union so styling stays centralized and routes get autocomplete.

```ts
type InputAddon =
  | { variant: "action"; icon: Icon; ariaLabel: string; onClick; disabled? }
  | { variant: "icon";   icon: Icon }
  | { variant: "text";   children: string };

// public slot prop type — structured union OR raw ReactNode escape hatch
type InputAddonSlot = InputAddon | React.ReactNode;
```

Rendering rules (`renderInputAddon`):

| Variant | Renders as |
|---------|------------|
| `action` | `InputGroupAddon` → `InputGroupButton` → `<Icon aria-hidden />` |
| `icon` | `InputGroupAddon` → `<Icon aria-hidden />` |
| `text` | `InputGroupAddon` → `InputGroupText` |
| raw `ReactNode` | `InputGroupAddon` → `{children}` as-is |

**Buttons must use `variant: "action"`** so every clickable addon shares `InputGroupButton` styling — change the button component once, everything updates. The raw `ReactNode` path is for true one-offs (badges, flags, composed layouts), not for buttons.

### Slot ownership

Public controls declare which slots are exposed:

- `TextInput` — both `leftAddon` and `rightAddon` open
- `PasswordInput` — `leftAddon` open; `rightAddon` **omitted** from the public type (the eye toggle owns it)
- Future `SelectInput` — `leftAddon` open; `rightAddon` defaults to a chevron `action` and is overridable

The wrapper-side props live in `InputWithAddonsProps` (`leftAddon?` / `rightAddon?`); each control either re-exports them, narrows them with `Omit`, or injects defaults internally.

## Bar styling

`controlShellVariants` and `controlInnerVariants` are split so the same chrome works in two compositions:

- **Bare path** (`Input`) — shell + inner applied to a single `<input>`. Focus, invalid, and disabled selectors fire on the input directly (`focus-visible:`, `aria-invalid:`, `disabled:`).
- **Grouped path** (`InputGroup`) — shell on the wrapper `<div>`; inner on the child `<input>` (or any element with `data-slot="input-group-control"`). Visual states are derived via `has-[[data-slot=input-group-control]:…]` so the focus ring wraps the entire group, addons included.

Splitting shell from inner means we never duplicate border/focus/invalid classes; the two compositions just consume the variants they need.

## Out of scope (for now)

- Form-level components (`SubmitButton`, `FormErrors`) — reserved for `formComponents` in `create-app-form.ts`.
- Domain terms in `CONTEXT.md` — this is UI infrastructure, not finance glossary.
- Textarea and select primitives — both will compose `InputGroup` when added; conventions in this ADR apply unchanged.
- A labelled `variant: "action"` end button (`{ variant: "action", label, … }`) — wait until a concrete need lands.

## Consequences

- Adding a field type means: implement a dumb control (often a thin wrapper around `StringInput`) → wrap with `fieldInputWrapper` → register in `fieldComponents`. See the guide.
- Routes stay thin: schema + `useAppForm` + `form.AppField`; server/auth errors remain route-local (outside the field stack).
- Adding an inline affordance to any string control is a prop, not a refactor — pass `leftAddon` or `rightAddon` with the right `variant`.
- Login uses `TextInput` for email and `PasswordInput` (with internal eye toggle) for password.

## Keeping this ADR current

When you change the form input **architecture** — layering, validation placement, label/error rules, registration pattern, addon contract, or bar-styling split — update this ADR in the same PR. If the change also affects the how-to steps, update [`docs/guides/adding-form-fields.md`](../guides/adding-form-fields.md) in the same PR. Stale ADRs are worse than none; treat doc updates as part of the definition change, not a follow-up.
