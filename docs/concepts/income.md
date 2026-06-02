# Income

## Purpose

Design notes for the income domain — how the model is shaped, which real-world cases it handles, and what is deliberately out of scope.

Read this when:

- Implementing or modifying anything under `src/domain/income/` (or the eventual equivalent).
- Reviewing a proposal that touches `Income source`, `Income receipt`, `Standalone receipt`, `Settlement platform`, or any FX-related term.
- Wondering "why isn't X modeled?" — check **Deferred** and **Out of scope** before reopening the decision.

This doc does **not** redefine domain terms — see `CONTEXT.md` (section **Money in**, plus the **Cash position** section it feeds). It does **not** capture architecture-level decisions — see `docs/adr/` if one exists later.

## Goals

The income concept exists to answer four concrete user questions:

1. **Expected vs received**: "How much do I expect to land on the 23rd, and was the actual amount different?"
2. **Foreign currency reality**: "I invoice in USD but spend in BRL — what will hit my account after the settlement platform takes its spread?"
3. **Far-future projection**: "Past the materialized window, what does my `Cash position` look like in 18 months if my income stays the same?"
4. **Reconciliation against the bank**: "When I open my banking app and confirm the balance, does the model agree?"

## Model at a glance

Two generators feed one consumer:

```
Income source ─────┐
Standalone receipt ┴──→ Income receipt ──→ Cash position
```

| Generator | Shape | Cardinality | Glossary |
|---|---|---|---|
| `Income source` | Recurring monthly invoiced obligation with FX support via a `Settlement platform`. | Generates many `Income receipts` on its `occurrence rules`. | CONTEXT.md → Money in |
| `Standalone receipt` | One-off arrival — either via a `Settlement platform` (foreign currency) or directly in `cash currency`. | Itself is a single `Income receipt`. | CONTEXT.md → Money in |

Every `Income receipt` carries a **`nominal amount`** in `income currency` and a **`settled amount`** in `cash currency`. When the two currencies match (e.g. a R$50 birthday gift), only the settled amount is meaningful.

Receipts flow through `Expected receipt → Received receipt`, with `Overdue receipt` as a flagged state for unpaid past-due rows.

## Scenario mapping

Real cases the model handles → how each maps:

| # | Case | Maps to |
|---|---|---|
| 1 | Salary $2,000/month, invoiced 5th and 20th, paid 3 business days later via Higlobe to BRL | `Income source` in `income currency` USD, two `occurrence rules`, `payment lag` 3 business days, linked to `Settlement platform` Higlobe |
| 2 | One-time $300 work bonus via Higlobe | `Standalone receipt`, `nominal amount` $300, same `Settlement platform` |
| 3 | One-time R$50 birthday gift (cash) | `Standalone receipt`, `settled amount` R$50 only, no `Settlement platform` |
| 4 | Invoice date falls on a Saturday | `Invoice date` shifts forward to the next business day; `payment lag` then counts from the shifted date |
| 5 | Client paid R$10 less than expected due to a rate dip | `Received receipt` with actual `settled amount` lower than expected; nominal stays as invoiced |
| 6 | Client is two weeks late on a receipt | `Overdue receipt` — still in `Cash position` math, flagged in UI |
| 7 | Salary raised mid-year from $2,000 to $2,200 | Edit the `Income source`; future `Expected receipts` regenerate at the new amount; past `Received` and any overrides are preserved |
| 8 | Ask "what will my cash position be 18 months from now?" | `Prospect` derives receipts from source rules beyond the ~6-month materialized window |

## Decisions

The grill that produced this model. Each line: **decision** — *rationale*.

- **Two generators: `Income source` + `Standalone receipt`** — covers recurring obligations and one-offs. No third generator needed (no income analogue to expenses' `Installment plan`).
- **Monthly schedule with `occurrence rules`** — period total split equally across rules unless specified. Supports "5th and 20th" salary, "monthly on the 1st" retainer.
- **Two-step date model: `Invoice date` + `Payment lag`** — invoice date shifts forward to next business day on weekends/holidays; payment lag is counted in business days from the shifted invoice date. Matches reality of "I send the invoice Monday, money lands Thursday."
- **Nominal + settled amount split** — every receipt tracks both. Nominal is what you invoice (USD); settled is what hits the bank (BRL). When currencies match, only settled is meaningful.
- **`Settlement platform` as a first-class entity** — owns the `Exchange spread` and `Assumed base rate`. Shared across multiple `Income sources` (e.g. salary and freelance both go through Higlobe).
- **`Effective exchange rate` formula** — `base × (1 − spread)`. Always computed from the platform's current rate config; never stored on the receipt directly.
- **`Assumed base rate` is user-controlled** — projections shift only when the user updates it. No automatic rate fetching in v1 (would require live FX data integration).
- **Per-receipt override of settled amount** — `Expected settled amount = nominal × effective rate` is the default; user can override one receipt's expected settled amount (e.g. "I know this one will be different because the platform is running a promo").
- **Standalone receipt has two flavors**: (a) `income currency` via a `Settlement platform` (same conversion math as sourced), or (b) `cash currency` direct (no platform, no nominal).
- **Lifecycle `Expected receipt → Received receipt`** — mark received with actual date and actual settled amount. Rate details are optional at receipt time; the truth is the BRL that landed.
- **`Overdue receipt` stays in `Cash position` math** — flagged in UI but still counted (you still expect the money). Resolved by marking `Received` or by **Cancelled expected receipt**.
- **`Cancelled expected receipt` is stored, not deleted** — row keeps `cancelled` status for audit; projections ignore it.
- **Materialization**: `Income source` materializes ~6 months of `Expected receipts`; `Derived receipts` are computed on the fly for `Prospect` beyond that window. Same math, different storage.
- **Past is sacred** — source edits regenerate only future `Expected receipts`. `Received`, `Overdue`, and per-receipt overrides are never rewritten.
- **`Ended source`** — `Income source` with an end date stops generating new receipts after that date. Existing receipts remain.
- **`Tracking start` from today** — past money is captured implicitly in the initial `Cash balance`; the app looks forward only. No backfill.
- **Single `Cash account` per user** — one bank account for now. `Total cash` is just the single balance.
- **No income categories** — users typically have 1–2 sources; the spread doesn't justify a categorization concept. Diverges from expenses, which do have `Expense category`.
- **FX rates and amounts at 2 decimal places** — spread, assumed base rate, effective rate, and projected settled amounts use two decimals everywhere (e.g. base `5.00`, spread `0.30%` → effective `4.99`, $1,000 nominal → ~R$4,990). **Received** settled amounts override projections when money arrives.
- **`Settlement platform` delete** — blocked while any `Income source` or `Income receipt` still references the platform (including **Standalone receipt** FX one-offs). The app returns a clear error; the user must detach or remove dependents first. DB `onDelete: cascade` is not relied on for user-initiated delete.

## Asymmetries vs. expenses

Justified by intrinsic domain shape, not oversight:

- **Two generators** vs. expenses' three — no `Installment plan` analogue. Income doesn't "split" arrivals over time; an invoice is paid in one settled amount.
- **FX path** — `nominal amount`, `Settlement platform`, `Exchange spread`, `Assumed base rate`. Expenses have none of this (they're cash-currency-only).
- **Invoice date + payment lag** — two-step schedule. Expenses collapse this into a single `Due date` (no invoicing step).
- **No `Amount kind` flag** — income always has a known nominal amount; estimates don't apply. Expenses need `fixed | estimated`.
- **No categories** — expenses categorize, income does not.

## Deferred

Considered during the grill and pushed past v1. Each is real, each is reversible:

- **Global assumed base rate** — v1 stores `Assumed base rate` on each **Settlement platform** because FX platforms are few. Later: one user-level default rate (BRL per USD) with an optional per-platform “override global configuration” flag when platforms differ slightly.
- **BR public holidays in business-day math** — v1 shifts invoice dates and payment lag on weekends only (Mon–Fri calendar). National holidays are not modeled yet.
- **Edit received receipts** — v1 is mark-once; correcting actual date or settled amount after **received** is deferred.
- **Live FX rate fetching** — `Assumed base rate` stays user-set. Wiring up a live rate source (Banco Central, a market data API) is a future integration.
- **Hybrid override at the rate level** — currently you override the **resulting settled amount**. A finer-grained override would let you keep the formula but plug in a different base rate per receipt. Not enough demand yet.
- **Non-monthly schedules** — quarterly retainers, annual bonuses with a fixed date. Route through `Standalone receipt` for now.
- **Variable amounts on `Income source`** — equivalent to expenses' `estimated`. Useful for commission-based income. Not needed for salary + freelance.
- **Multiple `Cash accounts` per user** — one is enough for v1; multi-account routing is a meaningful UX expansion.
- **Tax / withholding modeling** — gross-to-net conversion (e.g. INSS, IR) at the source. Today's model assumes the nominal amount IS what gets invoiced and ultimately settled.
- **Multiple `Settlement platforms` chained per source** — e.g. USD → intermediate → BRL. Today a source links to one platform.
- **`Settlement platform` delete (relaxed)** — allow delete when no `Income source` references the platform and no **expected** `Income receipt` does; **received** and **cancelled** rows may still reference it. Requires orphan/snapshot behavior on receipts so history is not wiped. Implement together with income-source delete/orphan rules.
- **Sub-relational overlay stacks** — e.g. income-source setup sheet + source form + settlement-platform create dialog when cash currency ≠ income currency. Reuses the same create dialog; see [`overlays.md`](../guides/overlays.md).
- **Auto-detect rate from received receipts** — "you've been receiving ~R$4,990 lately, want to bump the assumed rate?" Too magical for now.

## Out of scope

Not just deferred — intentionally not part of the income concept, ever or until a different concept is introduced:

- **Crypto / volatile-currency income** — `Income source` assumes a stable enough rate to make `Assumed base rate` meaningful. Crypto would need realtime mark-to-market, not a user-set rate.
- **Equity grants, vesting, stock options** — these aren't recurring cash arrivals. A future `Vesting` or `Holdings` concept could handle them.
- **Pension / retirement / annuity income** — likely fits as another `Income source` shape but with finite or actuarial scheduling. Out of scope until that life stage is a target user.
- **Loans received as income** — receiving R$10,000 from a loan isn't ongoing income; it would be modeled as a one-off `Standalone receipt` if at all, but the corresponding repayment liability is not modeled.
- **Expense reimbursements** — when an employer reimburses a work expense, it can be a `Standalone receipt` if you want it visible. There is no "match the reimbursement to the original expense" relationship modeled.
- **Multi-cash-currency** — `cash currency` is single-valued per user. A dual-residence user with both BRL and EUR accounts is not supported.

## Related

- `CONTEXT.md` — domain glossary (Money in section, plus Cash position section it feeds)
- `docs/concepts/expenses.md` — companion concept doc; mirrors many decisions
- `docs/adr/` — no income-specific ADRs at this time
- Linked GitHub issues — to be added by `/to-issues` after this concept stabilizes

## Maintenance

When you change the income **model** — generator shape, lifecycle, materialization rule, currency handling, FX formula, edit/regeneration semantics, or any scope boundary in **Deferred** / **Out of scope** — update this concept doc in the same PR.

If the change also affects domain terms, update `CONTEXT.md` (Money in section) in the same PR. If it affects the `Cash position` formula, update both this doc and `docs/concepts/expenses.md` (the asymmetries table) so the two halves stay in sync.

Stale concept docs are worse than none; treat doc updates as part of the definition change, not a follow-up.
