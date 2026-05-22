# Finance Tracker

Personal financial management for tracking money in, money out, and projected cash position over time.

## Language

### Money in

**Income source**:
A recurring definition of money you expect to receive — its name, total amount, monthly schedule, and payment timing rules.
_Avoid_: Income, paycheck, salary (use as attributes of a source, not as the concept name)

**Monthly period**:
The recurrence cycle for an **Income source** — a total amount split across **occurrence rules** within each calendar month.
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
A rule within an income source that defines one invoicing point in a period — e.g. "invoice on day 5 of each month." The period total is split equally across occurrence rules unless specified otherwise.
_Avoid_: Schedule entry, pay period

**Invoice date**:
The calendar date you send an invoice. If that date falls on a non-business day, it shifts to the next business day.
_Avoid_: Billing date, due date

**Payment lag**:
The number of business days after the invoice date before cash is expected to arrive. Each income receipt's date is the invoice date (after any shift) plus the payment lag, counted in business days.
_Avoid_: Delay, processing time, net terms

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
How much money you will have on a target date. Anchored on your latest **Cash balance**, then adjusted for **Income receipts** and expenses that fall after the as-of date through the target date — received ones for the past, expected ones for the future.
_Avoid_: Net worth, runway, liquidity

**Reconciliation**:
When you update your **Cash balance** to match what your bank app shows, setting a new **as-of date**. Resets the anchor — movements before that date are considered already reflected in the balance.
_Avoid_: Sync, balance update

**Tracking start**:
The point from which the app records data — typically today. Past money is captured implicitly in your initial **Cash balance**; the app looks forward from there.
_Avoid_: Start date, epoch, backfill date

**Ended source**:
An **Income source** with an **end date** — no new **Income receipts** are generated after that date. Existing receipts are kept.
_Avoid_: Deleted income, inactive source, archived source

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
- **Prospect** sums **Income receipts** and subtracts expenses when tracked.
- Each user has one **Cash account**; **Income receipts** settle into it.
- An **Ended source** stops generating receipts after its end date; existing receipts remain.

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
