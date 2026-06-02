# URL-driven overlays (sheet / dialog)

How to mount sheets and dialogs on a route using **search params** as the source of truth. Reference: [`src/routes/app/income/`](../../src/routes/app/income/) and [`income-route-search-schema.ts`](../../src/features/income/schemas/income-route-search-schema.ts).

## Rules

1. **Search params own visibility** — Open via `Link` or `navigate({ search })`; close by clearing those keys (preserve unrelated params).

2. **Shell vs body**
   - **Shell** (`*-dialog.tsx`, `*-sheet.tsx`): Radix wrapper, `open`, `onOpenChange`, title. Invalid search (e.g. unknown edit id after list loads) → early `<Navigate>` to the same route with cleaned search (see `app/route.tsx`), not `useEffect` + `navigate`. No `useAppForm` in the shell.
   - **Body** (`*-dialog-form.tsx`): `useAppForm`, mutations, row resolution, submit. Render the body inside `DialogContent` whenever the shell is mounted; do not toggle only the body (that flickers header/footer height).

3. **Forms belong in the body** — Extract `*-dialog-form.tsx` when an overlay has a form or heavy hooks. Avoid `useEffect` + `form.reset` as the primary fix.

4. **One composition root** — A single `*Overlays` component on the route reads `Route.useSearch()`, runs shared queries, and renders overlay shells for that page.

## Stack depth

- **Two levels** is normal: a list **sheet** + one **dialog** (create, edit, or delete — not more than one dialog action at a time).
- **Sheet + multiple dialog params** (e.g. create and edit together) is a bug — clear sibling dialog keys in `open*` navigate helpers.
- **Deeper stacks** are allowed only for deliberate **sub-relational creation** (e.g. income-source setup + nested settlement-platform create). Document the exception on that flow; do not generalize three dialogs on every route.

## Shared list + loading

When several overlays need the same list query:

- Run **one** conditional `useQuery` in the overlays host (`enabled` when any surface needs the list).
- Gate **dependent dialogs** on **`isLoading`** (first fetch), not **`isFetching`** (refetch after invalidation) — so open dialogs stay mounted while the cache refreshes.
- Show loading on the **primary surface** (usually the manage sheet). Mount dependent dialogs only after `!isLoading`.
- **Disable** entry points (e.g. Add, edit row) until the list has loaded so the URL cannot get ahead of the UI.

Do not prefetch overlay lists in the route loader unless the whole page needs them immediately.

## Opening overlays

- **`open*` helpers** should omit other dialog search keys for the same feature so only one dialog param is set at a time.
- Optional route-level `superRefine` can be added later if bad bookmarks become a problem; helpers are enough for now.

## File naming (flat `-lib/`)

| Pattern | Example |
|---------|---------|
| Route overlays host | `settlement-platform-overlays.tsx` |
| Sheet shell | `settlement-platform-sheet.tsx` |
| Dialog shell | `edit-settlement-platform-dialog.tsx` |
| Dialog body (form) | `edit-settlement-platform-dialog-form.tsx` |

Do not nest `-lib/` inside `-lib/`.

## Related

- [Feature end-to-end](./feature-end-to-end.md) — serverFns, mutations, forms, money/FX conversion at boundaries
- [Adding form fields](./adding-form-fields.md) — `useAppForm`, field components
