# Finance Tracker

Personal financial management for tracking money in, money out, and projected cash position over time.

## Further reading

This file is the glossary — it defines **what each term means**. To understand **why the model is shaped this way**, which real-world scenarios it handles, and what's deliberately out of scope, read the matching concept doc:

- [`docs/concepts/income.md`](docs/concepts/income.md) — design rationale for income (two generators, FX path, materialization, etc.)
- [`docs/concepts/expenses.md`](docs/concepts/expenses.md) — design rationale for expenses (three generators, categories, scope boundaries)

Refer to the relevant concept doc **before proposing changes** to that domain area. Then come back here to check that your changes don't conflict with the glossary's vocabulary.

## Language

### Money in

**Income source**:
A recurring definition of money you expect to receive — its name, total amount, monthly schedule, and payment timing rules.
_Avoid_: Income, paycheck, salary (use as attributes of a source, not as the concept name)

**Monthly period**:
The recurrence cycle for an **Income source** or **Expense source** — a total amount split across **occurrence rules** within each calendar month.
_Avoid_: Pay period, billing cycle

**Income receipt**:
A single expected or actual cash arrival — from an **Income source** schedule or created on its own (**Standalone receipt**). Tracks when money lands and how much, in **cash currency** and optionally in **income currency**.
_Avoid_: Payment, deposit, inflow, transaction

**Standalone receipt**:
An **Income receipt** with no **Income source** — for one-time money like a work bonus or a birthday gift. You set the **expected date** directly; no **occurrence rules** or **payment lag**. Feeds **Cash position** the same way as sourced receipts.
_Avoid_: Manual income, ad-hoc payment, orphan transaction

**Expected receipt**:
The projected date and amounts for an income receipt before money arrives — nominal amount (e.g. $1,000), expected settled amount (e.g. ~R$4,985), and expected date.
_Avoid_: Scheduled payment, pending deposit

**Received receipt**:
An income receipt once money has landed — **actual date** and **actual settled amount** recorded (e.g. R$4,995.00 on May 8). Nominal amount stays as invoiced. Rate details are optional; not required to confirm receipt.
_Avoid_: Cleared, confirmed transaction

**Overdue receipt**:
An **expected receipt** whose expected date has passed but hasn't been marked **received**. Still counts toward **Cash position** projections, but is flagged so you know something is off.
_Avoid_: Late payment, pending receipt

**Cancelled expected receipt**:
An **expected receipt** the user explicitly removed from projections (e.g. a client did not pay that invoice). Stored with **cancelled** status — not deleted — so history stays auditable and **Cash position** no longer counts it.
_Avoid_: Deleted receipt, voided payment

**Materialized receipts**:
Expected **Income receipts** the app creates and stores upfront — a rolling window (~6 months ahead) from each **Income source**.
_Avoid_: Scheduled entries, cached receipts

**Derived receipts**:
Expected **Income receipts** computed on the fly from **Income source** rules when you **Prospect** a date beyond the materialized window.
_Avoid_: Virtual receipts, calculated entries

**Prospect**:
To ask what your **Cash position** (or later, a goal) looks like on a specific future date — including dates far beyond materialized receipts. The app derives missing **Income receipts** from source rules as needed.
_Avoid_: Forecast, project, simulate

**Nominal amount**:
The fixed amount in **income currency** — what you invoice (e.g. $1,000 USD). Optional on **Standalone receipts** that arrive directly in **cash currency** (e.g. a R$50 gift). Does not change when the exchange rate moves.
_Avoid_: Gross amount, invoice total (when referring to foreign-currency income)

**Settled amount**:
The amount in your cash currency that actually arrives (or is expected to arrive) after currency conversion (e.g. R$4,995.00 BRL).
_Avoid_: Net amount, deposited amount, converted amount

**Settlement platform**:
The service that converts income currency into cash currency and sends it to your bank (e.g. Higlobe).
_Avoid_: Payment processor, payout provider, FX provider

**Base exchange rate**:
The reference rate before the settlement platform's spread — e.g. 1 USD = 5.0000 BRL.
_Avoid_: Market rate, mid-market rate

**Exchange spread**:
A percentage the settlement platform takes off the base exchange rate (e.g. 0.30% on Higlobe). Not a flat fee on the dollar amount.
_Avoid_: Conversion fee, commission, FX fee

**Effective exchange rate**:
The rate actually applied after spread: base exchange rate × (1 − exchange spread). E.g. 5.0000 × 0.997 = 4.9850 BRL per USD.
_Avoid_: Applied rate, final rate

**Assumed base rate**:
The base exchange rate you configure for projecting future settled amounts. Updated manually when you want forecasts to shift.
_Avoid_: Expected rate, projected rate

**Cash currency**:
The single currency everything cash-impactful is tracked in — **Cash balance**, **settled amounts**, **Prospect** results, and (when added) expenses. E.g. BRL. **Nominal amounts** in **income currency** (e.g. USD) are kept for invoicing and conversion but are not what drives **Cash position**.
_Avoid_: Base currency, home currency, local currency

**Income currency**:
The currency an income source invoices in (e.g. USD). May differ from cash currency.
_Avoid_: Source currency, foreign currency

**Occurrence rule**:
A rule within an **Income source** or **Expense source** that defines one scheduled point in a period — e.g. "invoice on day 5" for income, "due on day 25" for expenses. The period total is split equally across occurrence rules unless specified otherwise.
_Avoid_: Schedule entry, pay period

**Invoice date**:
The calendar date you send an invoice. If that date falls on a non-business day, it shifts to the next business day.
_Avoid_: Billing date, due date

**Payment lag**:
The number of business days after the invoice date before cash is expected to arrive. Each income receipt's date is the invoice date (after any shift) plus the payment lag, counted in business days.
_Avoid_: Delay, processing time, net terms

### Money out

**Expense source**:
A recurring definition of money you expect to pay — its name, monthly schedule, and either a **fixed** or **estimated** amount per period. Mirrors **Income source** but in the opposite direction (money leaves instead of arrives) and only operates in **cash currency**.
_Avoid_: Bill, recurring payment, subscription (use as attributes, not as the concept name)

**Amount kind**:
Whether an **Expense source**'s amount is **fixed** (e.g. R$3,000 rent, same every month) or **estimated** (e.g. ~R$50 water bill, true amount known only when the bill arrives). Drives UX prompts and projection confidence; does not change how an **Expense payment** is stored.
_Avoid_: Variable amount, budget amount

**Start date**:
The creation-time date from which an **Expense source** begins generating **Expected payments**. Defaults to today's next occurrence (including today if today is a due day) and is **immutable after creation** — to "restart" a source with a different start date, **end** it and create a new one. Off-pattern entries before the start date go through **Standalone payment**.
_Avoid_: First payment date (ambiguous), tracking date, kickoff date

**Installment plan**:
A finite-count purchase paid over N monthly installments — e.g. a R$1,090.70 notebook over 9 months. Has a total amount, installment count, first due date, and a derived per-installment amount. Generates exactly N **Expense payments**. No income analogue. Mechanism (direct debit, bank transfer, credit card statement) is out of scope — only the cash-out dates and amounts matter for **Cash position**.
_Avoid_: Financing, loan, payment plan (when used as the concept name), parcelamento

**Expense payment**:
A single expected or actual cash departure — from an **Expense source** schedule, an **Installment plan**, or created on its own (**Standalone payment**). Always in **cash currency**.
_Avoid_: Expense, debit, outflow, transaction

**Standalone payment**:
An **Expense payment** with no generator — for one-off purchases like a R$90 pizza delivery, an annual tax payment, or any cash departure without a recurring obligation. You set the **due date** directly. Feeds **Cash position** the same way as sourced payments.
_Avoid_: Manual expense, ad-hoc payment, orphan transaction

**Expense category**:
A per-user classification that every **Expense source**, **Installment plan**, and **Standalone payment** carries — e.g. Moradia, Alimentação, Transporte, Saúde. Required. Drives by-category reporting in the end-of-month view. New users are seeded with a default set on signup; they can rename, reorder, add, and delete (only when no item references the category). Flat, no hierarchy. **Income does not use categories** — the spread doesn't justify it.
_Avoid_: Tag, label, bucket, group

**Expected payment**:
The projected due date and amount for an **Expense payment** before money leaves — e.g. R$3,000 rent due on the 25th, or ~R$50 water bill due around the 10th.
_Avoid_: Scheduled payment, pending bill

**Paid payment**:
An **Expense payment** once cash has left — **actual date** and **actual amount** recorded (e.g. R$57.00 paid on May 9 for an estimated R$50 water bill). For **fixed** sources, actual usually matches expected. For **estimated** sources and **Standalone payments**, the actual is the source of truth.
_Avoid_: Settled expense, cleared transaction

**Due date**:
The calendar date an **Expense payment** is expected to leave your **Cash account**. For **Expense sources**, derived from the source's **occurrence rules**. For **Installment plans**, derived from the first due date plus N months. For **Standalone payments**, set directly by the user. If the date falls on a non-business day, it shifts forward to the next business day — mirrors income's **invoice date** rule. The user records the real-world date when they mark the payment **paid**; the shifted **due date** is the projection target.
_Avoid_: Payment date (ambiguous between expected and actual)

**Overdue payment**:
An **Expected payment** whose **due date** has passed but hasn't been marked **paid**. Still counts toward **Cash position** projections (you still owe the money), but is flagged so you know something needs attention. Resolved by marking it **paid** or by explicit cancellation.
_Avoid_: Late bill, missed payment, pending expense

**Materialized payments**:
**Expected payments** the app creates and stores upfront — a rolling ~6-month window for each **Expense source**, and **all N installments** for each **Installment plan**.
_Avoid_: Scheduled entries, cached payments

**Derived payments**:
**Expected payments** computed on the fly from **Expense source** rules when **Prospect** asks for a date beyond the materialized window. **Installment plans** are always fully materialized, so they never need derivation.
_Avoid_: Virtual payments, calculated entries

### Cash position

**Cash account**:
The bank account where your money lives (e.g. a checking account). Holds a **cash balance** in **cash currency**. One per user for now.
_Avoid_: Account, bank (as the concept name — "bank" is fine in a label)

**Cash balance**:
The amount of money in your **Cash account** at a point in time, plus the **as-of date** when you last confirmed it against the real world (e.g. checked in the banking app).
_Avoid_: Current balance, wallet balance, available funds

**Total cash**:
How much liquid money you have across all **Cash accounts**. With a single bank, this is just your **Cash account** balance.
_Avoid_: Total balance, net cash

**Cash position**:
How much money you will have on a target date. Anchored on your latest **Cash balance**, then adjusted for **Income receipts** and **Expense payments** that fall after the as-of date through the target date — confirmed ones (**received** / **paid**) for the past, expected ones for the future.
_Avoid_: Net worth, runway, liquidity

**Reconciliation**:
When you update your **Cash balance** to match what your bank app shows, setting a new **as-of date**. Resets the anchor — movements before that date are considered already reflected in the balance.
_Avoid_: Sync, balance update

**Tracking start**:
The point from which the app records data — typically today. Past money is captured implicitly in your initial **Cash balance**; the app looks forward from there.
_Avoid_: Start date, epoch, backfill date

**Ended source**:
An **Income source** or **Expense source** with an **end date** — no new receipts or payments are generated after that date. Existing rows are kept. (E.g. you cancel Netflix on June 30 — the Netflix source still owns the June payment but generates nothing afterward.)
_Avoid_: Deleted income, deleted expense, inactive source, archived source

### Relationships

- One **Income source** has one or more **occurrence rules** and one **payment lag**. A user can have many **Income sources**.
- One **Income source** generates many **Income receipts** on its schedule.
- **Income receipts** carry a **nominal amount** (income currency) and a **settled amount** (cash currency).
- Projections and expense forecasts use **settled amounts** in **cash currency**.
- When income currency ≠ cash currency, an **Income source** links to a **Settlement platform** with an **exchange spread** and an **assumed base rate**.
- A **Settlement platform** can be shared by many **Income sources** (e.g. both freelance and salary through Higlobe).
- Expected settled amount = nominal amount × effective exchange rate (or overridden per receipt).
- **Income sources** **materialize** expected receipts ~6 months ahead; editing a source regenerates future **expected** receipts (not **received** ones or manual overrides).
- **Prospect** queries beyond that window **derive** receipts from source rules on demand — same math, not stored until inside the window.
- **Income receipts** can come from an **Income source**, or be **Standalone receipts** with no source.
- A **Standalone receipt** in **income currency** links to a **Settlement platform** (e.g. $300 bonus via Higlobe). A **Standalone receipt** in **cash currency** has only a **settled amount** (e.g. R$50 gift).
- **Income receipts** can be auto-generated, manually created, or auto-generated then overridden.
- **Prospect** sums **Income receipts** and subtracts **Expense payments**.
- Each user has one **Cash account**; **Income receipts** settle into it and **Expense payments** debit it.
- An **Ended source** stops generating receipts after its end date; existing receipts remain.
- One **Expense source** has one or more **occurrence rules** and an **amount kind** (**fixed** or **estimated**). A user can have many **Expense sources**.
- One **Expense source** generates many **Expense payments** on its schedule; one **Installment plan** generates exactly N **Expense payments**.
- **Expense payments** can come from an **Expense source**, an **Installment plan**, or be **Standalone payments** with no generator.
- **Expense payments** live entirely in **cash currency** — no FX path (expenses do not invoice in a foreign currency).
- An **Expense payment** carries an **expected amount** and, once paid, an **actual amount** and **actual date**. **Fixed** sources usually pay exactly the expected amount; **estimated** sources and **Standalone payments** rely on the actual.
- Editing an **Expense source** regenerates future **Expected payments** only — never **Paid**, **Overdue**, or manually overridden ones. Past is sacred; future is regenerable; overrides win.
- An **Installment plan** is immutable after creation — delete + recreate to correct mistakes. Cancelling an **Installment plan** deletes remaining **Expected** and **Overdue** payments but keeps **Paid** history.
- Deleting an **Expense source** removes future **Expected** and **Overdue** payments and orphans **Paid** history (shown in the UI with the captured source name, e.g. "Rent (deleted source)"). Reconciliation depends on these historical rows.
- Every **Expense source**, **Installment plan**, and **Standalone payment** belongs to exactly one **Expense category**. New users are seeded with a default category set on signup.
- An **Expense category** cannot be deleted while linked to any source, plan, or payment — reassign first.

## Example dialogue

> **Dev:** A user has one income — salary, $2,000 a month, invoiced on the 5th and 20th, paid three business days later. Invoiced in USD but bank and expenses are in BRL. Higlobe converts at a 0.30% spread.
>
> **User:** That's one **Income source** in **income currency** USD, settled through **Higlobe**. Each **Income receipt** has a **nominal amount** of $1,000. For projections they set an **assumed base rate** of 5.00 — the app computes the **settled amount** as $1,000 × 5.00 × 0.997 = R$4,985. When Higlobe pays out, they mark it **received** with the actual **settled amount** from the withdraw detail (R$4,995.00 at base rate 5.01).
>
> **Dev:** On the 10th, how much will they have on the 30th?
>
> **User:** Start from their **Cash balance** from the last **Reconciliation**. Add **received receipts** between that as-of date and today, subtract expenses paid in that window — that's where they are now. Then add **expected receipts** still due before the 30th (the ~23rd payout), subtract expenses due before the 30th (rent, bills, taxes). That's their **Cash position** on the 30th.
>
> **Dev:** What about a one-time $300 work bonus invoiced through Higlobe, or a R$50 birthday gift in cash?
>
> **User:** The bonus is a **Standalone receipt** — $300 nominal via **Higlobe**, same conversion math as salary. The gift is also a **Standalone receipt**, but just R$50 **settled amount** directly — no **Income source**, no **Settlement platform**.
>
> **Dev:** Now expenses: R$3,000 rent on the 25th, ~R$50 water bill around the 10th, a R$1,090.70 notebook bought in 9 installments starting next month, and a R$90 pizza last Tuesday.
>
> **User:** Rent is an **Expense source** with **amount kind** = **fixed**, **occurrence rule** day 25, **start date** today's-next-occurrence. Water is also an **Expense source** but **amount kind** = **estimated** at R$50 — the app generates **Expected payments** at R$50, and when the bill arrives the user updates the expected (or jumps straight to **Paid** with the actual). The notebook is an **Installment plan** — total R$1,090.70, 9 installments, first due next month; the app materializes all 9 **Expected payments** upfront. The pizza is a **Standalone payment** — R$90, **due date** last Tuesday, marked **paid** the same day. Each one is assigned to an **Expense category**: Moradia, Serviços, Pessoal, Alimentação.
>
> **Dev:** What if the user forgets to mark rent paid on the 25th?
>
> **User:** It becomes an **Overdue payment**. **Cash position** still subtracts R$3,000 — they still owe the rent — but the UI flags it red until they mark it **paid** or cancel it.
