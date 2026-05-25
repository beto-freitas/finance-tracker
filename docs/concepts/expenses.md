# Expenses

## Purpose

Design notes for the expenses domain — how the model is shaped, which real-world cases it handles, and what is deliberately out of scope.

Read this when:

- Implementing or modifying anything under `src/domain/expenses/` (or the eventual equivalent).
- Reviewing a proposal that touches `Expense source`, `Installment plan`, `Standalone payment`, `Expense payment`, or `Expense category`.
- Wondering "why isn't X modeled?" — check **Deferred** and **Out of scope** before reopening the decision.

This doc does **not** redefine domain terms — see `CONTEXT.md` (sections **Money out**, **Cash position**). It does **not** capture architecture-level decisions — see `docs/adr/` if one exists later.

## Goals

The expenses concept exists to answer three concrete user questions, all in **cash currency** (BRL):

1. **Due-date forecasting**: "Rent is due on the 25th — how much will I have then, and after paying it?"
2. **End-of-month cash position**: "After all mapped and estimated expenses, how much do I have left?"
3. **Mapped + estimated tracking**: support both fixed obligations (rent) and estimated ones (water bill) without forcing a single shape.

## Model at a glance

Three generators feed one consumer:

```
Expense source ──┐
Installment plan ─┼──→ Expense payment ──→ Cash position
Standalone payment┘
```

| Generator | Shape | Cardinality | Glossary |
|---|---|---|---|
| `Expense source` | Recurring monthly obligation. `Amount kind = fixed \| estimated`. | Generates many `Expense payments` on its `occurrence rules`. | CONTEXT.md → Money out |
| `Installment plan` | Finite-count purchase paid over N months. | Generates exactly N `Expense payments`. | CONTEXT.md → Money out |
| `Standalone payment` | One-off cash departure. | Itself is a single `Expense payment`. | CONTEXT.md → Money out |

Every `Expense source`, `Installment plan`, and `Standalone payment` belongs to one **`Expense category`** (required, per-user, seeded on signup).

`Expense payments` flow through the lifecycle `Expected payment → Paid payment`, with `Overdue payment` as a flagged state for unpaid past-due rows.

## Scenario mapping

Real cases the user enumerated → how each maps to the model:

| # | Case | Maps to |
|---|---|---|
| 1 | Installments — R$1,090.70 over 9 months | `Installment plan` (total + count + first due date) |
| 2 | One-time today — pizza R$90 | `Standalone payment` (due date = today) |
| 3 | One-time future — pizza R$90 on the 13th | `Standalone payment` (due date = future) — same shape as #2 |
| 4 | Future installments — R$45 × 2 starting 13th | `Installment plan` (first due date = future) — same shape as #1 |
| 5 | Rent forever — R$3,000 monthly | `Expense source`, `Amount kind = fixed` |
| 6 | Water bill — ~R$50 monthly | `Expense source`, `Amount kind = estimated` |

Six cases collapse to three generators.

## Decisions

The grill that produced this model. Each line: **decision** — *rationale*.

- **Mirror income structurally** — `Expense source` ↔ `Income source`, `Expense payment` ↔ `Income receipt`, `Standalone payment` ↔ `Standalone receipt`. Same patterns, same mental model.
- **Monthly schedule with `occurrence rules`** — same shape as income; no `invoice date` / `payment lag` concepts (expenses don't invoice, money leaves on the due date).
- **`Installment plan` as a peer generator** — finite purchases have a different shape than ongoing obligations (total + count are first-class, not derived). No income analogue.
- **`Amount kind = fixed \| estimated` flag on `Expense source`** — drives UX prompts and projection confidence; payment data shape stays uniform. No auto-learning of estimates from history in v1.
- **Lifecycle `Expected payment → Paid payment`** — mirrors `Expected receipt → Received receipt`. `Paid payment` records actual date and actual amount.
- **`Overdue payment` stays in `Cash position` math** — flagged in UI but still subtracted from projections (you still owe the money). Resolved by `Paid` or explicit cancellation.
- **Materialization**: `Expense source` materializes ~6 months ahead with `Derived payments` computed beyond that window; `Installment plan` materializes all N upfront (finite); `Standalone payment` is created 1:1 (no generator).
- **Past is sacred** — source edits regenerate only future `Expected payments`. `Paid`, `Overdue`, and per-payment overrides are never rewritten.
- **`Installment plan` is immutable after creation** — delete + recreate to correct mistakes. Cancellation deletes remaining `Expected`/`Overdue` rows but keeps `Paid` history.
- **Deleting an `Expense source` orphans `Paid` history** — UI shows "Rent (deleted source)". Reconciliation depends on these rows; cascading would silently wipe history.
- **`Due date` shifts forward to next business day** — mirrors income's `invoice date` rule. No divergence between the two halves of the domain.
- **`Start date` on `Expense source`** is explicit at creation, immutable after. Defaults to today's next occurrence. Off-pattern entries before the start date go through `Standalone payment`.
- **`Expense category` as first-class entity** — required on all three generators, per-user, seeded on signup, flat (no hierarchy), block-delete with linked items. **Income does not use categories** — too little spread to justify.

## Asymmetries vs. income

Justified by intrinsic domain shape, not oversight:

- **Three generators** vs. income's two — `Installment plan` is unique to expenses.
- **Cash-currency-only** — expenses don't invoice in a foreign currency; no FX path, no `Settlement platform`, no nominal/settled split.
- **`Amount kind` flag** — income invoices know the amount; expenses sometimes only estimate.
- **Categories on expenses, not income** — users typically have 1–2 income sources, 10+ expenses.

## Deferred

Considered during the grill and pushed past v1. Each is real, each is reversible:

- **Auto-update estimates from history** — e.g. "your water bill averaged R$52 last 3 months — bump the estimate?" Too magical for v1; user-controlled only.
- **Per-source business-day shift policy** — currently all sources shift forward (mirroring income). Per-source `shift = forward \| backward \| none` would handle auto-debit-goes-early bills. Add when a real frustration appears.
- **Subcategories** — `Expense category` is flat. Hierarchy adds rollup ambiguity; flat is enough for ~10–20 categories.
- **Category-level budgets** — "max R$1,500/month for Food" with overrun alerts. Separate feature, separate UI surface.
- **Multi-category tagging** — one payment in multiple categories. Single category is enforced for v1.
- **Non-monthly schedules** — annual taxes, quarterly things. Route through `Standalone payment` for v1.
- **Confidence band in `Cash position`** — surface "R$X of this projection is estimated." UX work, not domain.
- **Pause / suspend an `Expense source`** — currently the only states are active and `Ended source`. Pause-and-resume is an extra state we don't need yet.
- **Edit an `Installment plan`** — immutable in v1. If real "fix a typo" pain shows up, allow narrow edits (name, category) without touching financial terms.

## Out of scope

Not just deferred — intentionally not part of the expenses concept, ever or until a different concept is introduced:

- **Interest-bearing financing** (true mortgages with principal/interest amortization). `Installment plan` is fixed-amount-per-period only. A future `Loan` or `Financing` concept could layer in interest math without disturbing this model.
- **Credit-card statement modeling** — tracking what's currently on a card, statement close dates, minimum payments. From `Cash position`'s perspective, only the cash-out events matter; statement modeling is a separate problem.
- **Expense reimbursements / refunds** — money coming back to you is an `Income receipt` (or a `Standalone receipt`), not a negative expense.
- **Multi-currency expenses** — expenses are cash-currency-only by design. A USD-denominated expense paid in BRL is just an `Expense payment` in BRL with whatever the user paid.
- **Shared expenses / splits** — "I owe my roommate half the rent." A future shared-account concept could address this; not part of the personal-finance model.
- **Income categorization** — `Expense category` does not extend to income.

## Related

- `CONTEXT.md` — domain glossary (Money out, Cash position sections)
- `docs/concepts/income.md` — companion concept doc; mirrors many decisions
- `docs/adr/` — no expense-specific ADRs; this concept aligns fully with the income patterns
- Linked GitHub issues — to be added by `/to-issues` after this concept stabilizes

## Maintenance

When you change the expenses **model** — generator shape (`Expense source`, `Installment plan`, `Standalone payment`), lifecycle, materialization rule, `Amount kind` semantics, `Expense category` rules, edit/regeneration semantics, or any scope boundary in **Deferred** / **Out of scope** — update this concept doc in the same PR.

If the change also affects domain terms, update `CONTEXT.md` (Money out section) in the same PR. If it affects the `Cash position` formula, update both this doc and `docs/concepts/income.md` (the asymmetries table) so the two halves stay in sync.

Stale concept docs are worse than none; treat doc updates as part of the definition change, not a follow-up.
