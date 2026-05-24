# Form input architecture

Forms use TanStack Form with a three-layer stack: `useAppForm` registers field components; `fieldInputWrapper` binds TanStack field state to a dumb control and renders the shared `BaseField` shell; each control (e.g. `TextInput`) only bridges native events to a typed value. Validation is a form-level Zod schema (Standard Schema); labels are derived from field names unless overridden; errors show once a field is touched or submit has been attempted.

**Guide:** step-by-step instructions for adding a new field type live in [`docs/guides/adding-form-fields.md`](../guides/adding-form-fields.md).

## Layering

```
useAppForm / form.AppField
  → field.TextInput          (registered in create-app-form.ts)
    → fieldInputWrapper(...)  TanStack binding + label/error wiring
      → BaseField.*           visual shell (label, description, error)
        → TextInput           dumb control; bridges DOM → typed value
```

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Form hook | `src/lib/form/create-app-form.ts` | `useAppForm`, `withForm`; `fieldComponents` registry |
| TanStack contexts | `src/lib/form/contexts.ts` | `useFieldContext`, `useFormContext` |
| Field wrapper | `src/lib/form/field-input-wrapper.tsx` | Binds field state; derives label; shows errors; renders `BaseField` |
| Visual shell | `src/components/form/base-field.tsx` | Compound `BaseField.*` — no TanStack knowledge |
| Control | `src/components/form/<name>-input.tsx` | Dumb component; implements `FieldControlProps<TValue>` |
| Shared chrome | `src/components/form/control-variants.ts` | `controlVariants` — height, border, focus, invalid styling |

**Rejected alternative:** a single smart field component that owns both TanStack wiring and rendering. Splitting wrapper (binding) from control (value bridging) from shell (markup) keeps new input types small and testable.

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

- Each control type owns one value shape (`string` for `TextInput`, `number` for a future `NumberInput`, etc.).
- `TextInput` is `type="text"` only — password, email, and number are separate registered components, not props on `TextInput`.
- New controls reuse `controlVariants` (via shadcn `Input` or directly) so every "bar" looks identical.

## Out of scope (for now)

- Form-level components (`SubmitButton`, `FormErrors`) — reserved for `formComponents` in `create-app-form.ts`.
- Domain terms in `CONTEXT.md` — this is UI infrastructure, not finance glossary.

## Consequences

- Adding a field type means: implement a dumb control → wrap with `fieldInputWrapper` → register in `fieldComponents`. See the guide.
- Routes stay thin: schema + `useAppForm` + `form.AppField`; server/auth errors remain route-local (outside the field stack).
- Login currently uses `TextInput` for email/password as a smoke test; dedicated `EmailInput` / `PasswordInput` are follow-ups.

## Keeping this ADR current

When you change the form input **architecture** — layering, validation placement, label/error rules, or registration pattern — update this ADR in the same PR. If the change also affects the how-to steps, update [`docs/guides/adding-form-fields.md`](../guides/adding-form-fields.md) in the same PR. Stale ADRs are worse than none; treat doc updates as part of the definition change, not a follow-up.
