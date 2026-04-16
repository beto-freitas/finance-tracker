# Finance Tracker — Product Requirements Document

## 1. Overview

**Finance Tracker** is a personal finance management web app that lets users
track expenses, earnings, and budgets in one place. Users can log one-time or
recurring transactions, organize expenses by category, set per-category budget
limits, and view a visual dashboard summarizing their financial health.

**Target user:** Individuals who want a simple, clean tool to understand where
their money goes and where it comes from.

## 2. Tech Stack

| Layer            | Technology                                           |
| ---------------- | ---------------------------------------------------- |
| Framework        | TanStack Start (full-stack React w/ TanStack Router) |
| Server State     | TanStack Query (React Query)                         |
| Auth             | BetterAuth (email/password)                          |
| ORM              | Drizzle ORM (v1 beta)                                |
| Database         | Turso (libSQL / SQLite edge)                         |
| UI Components    | shadcn/ui                                            |
| Charts           | Recharts (via shadcn/ui chart components)            |
| Animations       | Framer Motion                                        |
| State Management | Zustand (only if client-side state needs arise)      |
| Styling          | Tailwind CSS (bundled with shadcn)                   |

### Data Fetching Pattern (TanStack Query + Router)

All server data flows through **TanStack Query**. TanStack Router loaders exist
**only** to kick off queries early for faster first page loads — they must
**never return data directly**.

**Rules:**

1. **Loaders call `queryClient.ensureQueryData()` / `prefetchQuery()` / `fetchQuery()` only.** No raw fetch calls or direct data returns from loaders. This keeps the cache as the single source of truth.
2. **Components consume data via `useQuery()` / `useSuspenseQuery()`.** The loader ensures the cache is warm by the time the component renders.
3. **Mutations use `useMutation()` with `onSuccess` cache invalidation.** All data updates go through React Query's mutation lifecycle, invalidating relevant queries so the UI stays in sync.
4. **Always use `queryOptions()` and `mutationOptions()` factories.** Every query/mutation is defined as a standalone options object (via `queryOptions()` / `mutationOptions()` from `@tanstack/react-query`). This standardizes keys, functions, and stale times in one place, and makes them reusable across loaders and components.

## 3. Core Concepts & Terminology

| Term           | Definition                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Expense**    | Money going out. Has an amount, category, date, optional recurrence, and description.                               |
| **Earning**    | Money coming in. Has an amount, source name, date, optional recurrence, and description.                            |
| **Category**   | A label for grouping expenses (e.g. Food, Entertainment, Bills). Ships with defaults; users can create custom ones. |
| **Budget**     | A monthly spending limit set per category. Dashboard shows progress toward each limit.                              |
| **Recurrence** | A transaction that repeats on a schedule: weekly, monthly, or yearly, with an optional end date.                    |

## 4. Authentication

- **Method:** Email + password only (no OAuth, no magic links).
- **Library:** BetterAuth.
- **Flows:**
  - **Sign up:** Email, password, confirm password. Email validation format-only (no verification email for v1).
  - **Login:** Email + password.
  - **Session:** Persistent session managed by BetterAuth. Redirect to login on expiry.
  - **Logout:** Clear session, redirect to landing page.

## 5. Pages & Screens

### 5.1 Landing Page (`/`)

- **Purpose:** Marketing/intro page for unauthenticated users.
- **Content:**
  - Hero section with tagline and brief app description.
  - Feature highlights (3-4 cards: track expenses, manage earnings, set budgets, visual dashboard).
  - Call-to-action buttons: "Get Started" → signup, "Login" → login.
- **Design:** Minimal & clean (Linear/Vercel aesthetic). Subtle scroll animations via Framer Motion. Lots of whitespace, muted color palette.
- **Behavior:** If user is already authenticated, redirect to `/app`.

### 5.2 Login Page (`/login`)

- **Content:** Email input, password input, submit button, link to signup.
- **Validation:** Client-side (required fields, email format) + server-side (credentials check).
- **On success:** Redirect to `/app`.

### 5.3 Signup Page (`/signup`)

- **Content:** Email input, password input, confirm password input, submit button, link to login.
- **Validation:** Client-side (required, email format, password match, minimum 8 chars) + server-side (duplicate email check).
- **Post-signup:** Auto-login and redirect to `/app`. Seed default categories for the new user.
- **Currency selection:** Prompt user to pick their currency on first login (onboarding step) or default to USD with option to change in settings.

### 5.4 Dashboard (`/app` — default authenticated page)

- **Purpose:** At-a-glance financial overview. This is the main authenticated landing page.
- **Summary cards (top row):**
  - Total income (current month)
  - Total expenses (current month)
  - Net balance (income − expenses, current month)
  - Top spending category (current month)
- **Charts (below cards):**
  - **Expenses by category** — Pie/donut chart showing category breakdown for the selected period.
  - **Monthly trend** — Bar chart comparing income vs. expenses over the last 6 months.
  - **Spending by day of week** — Bar chart showing which days the user spends the most.
- **Filters:** Month/year selector to view different periods.
- **Budget progress:** Per-category progress bars showing spent vs. budget limit (for categories with budgets set).

### 5.5 Expenses Page (`/app/expenses`)

- **Purpose:** Manage all expenses.
- **View:** Table/list of expenses with columns: description, amount, category, date, recurrence status.
- **Actions:**
  - **Add expense:** Modal/sheet form with fields:
    - Description (text, required)
    - Amount (number, required)
    - Category (select from existing categories, required)
    - Date (date picker, defaults to today)
    - Recurrence (select: none / weekly / monthly / yearly, default: none)
    - End date (date picker, optional, only shown if recurrence ≠ none)
  - **Edit expense:** Same form, pre-filled.
  - **Delete expense:** Confirmation dialog.
- **Filters:** By category, by date range, by recurrence type.
- **Sorting:** By date (default: newest first), by amount.

### 5.6 Earnings Page (`/app/earnings`)

- **Purpose:** Manage all income sources.
- **View:** Table/list of earnings with columns: source name, amount, date, recurrence status.
- **Actions:**
  - **Add earning:** Modal/sheet form with fields:
    - Source / Description (text, required) — e.g. "Salary", "Freelance project"
    - Amount (number, required)
    - Date (date picker, defaults to today)
    - Recurrence (select: none / weekly / monthly / yearly, default: monthly)
    - End date (date picker, optional)
  - **Edit earning:** Same form, pre-filled.
  - **Delete earning:** Confirmation dialog.
- **Filters:** By date range, by recurrence type.
- **Sorting:** By date (default: newest first), by amount.

### 5.7 Transactions History Page (`/app/transactions`)

- **Purpose:** Unified view of all transactions (both expenses and earnings).
- **View:** Chronological list with type indicator (expense/earning), description, amount, category (expenses only), date.
- **Filters:**
  - Type: All / Expenses / Earnings
  - Date range picker
  - Category (for expenses)
  - Search by description
- **Sorting:** By date, by amount.

### 5.8 Categories Page (`/app/categories`)

- **Purpose:** Manage expense categories and their budgets.
- **Default categories seeded on signup:** Food, Transport, Entertainment, Bills & Utilities, Shopping, Health, Education, Other.
- **Actions:**
  - **Add category:** Name, optional color/icon, optional monthly budget.
  - **Edit category:** Update name, color/icon, budget.
  - **Delete category:** Only if no expenses are linked (or reassign first). Defaults cannot be deleted, only hidden.
- **Budget setting:** Each category has an optional monthly budget field. This feeds the dashboard budget progress bars.

### 5.9 Settings Page (`/app/settings`)

- **Content:**
  - **Currency:** Dropdown to change display currency (BRL, USD, EUR, GBP, etc.). Format-only, no conversion.
  - **Profile:** View/update email. Change password.
  - **Account:** Delete account (with confirmation).

## 6. Data Model (Drizzle v1 beta + Turso/SQLite)

All tables use Drizzle's SQLite column types from `drizzle-orm/sqlite-core`.

### `users`

Managed by BetterAuth (creates `user`, `session`, `account`, `verification` tables). Extended with:

| Column     | Type   | Constraints          | Notes          |
| ---------- | ------ | -------------------- | -------------- |
| `currency` | `text` | NOT NULL, default `"USD"` | ISO 4217 code |

### `categories`

| Column      | Type      | Constraints                        | Notes                           |
| ----------- | --------- | ---------------------------------- | ------------------------------- |
| `id`        | `text`    | PRIMARY KEY, auto-generated UUID   |                                 |
| `userId`    | `text`    | NOT NULL, FK → `user.id`          |                                 |
| `name`      | `text`    | NOT NULL                           |                                 |
| `color`     | `text`    | nullable                           | Hex color                       |
| `icon`      | `text`    | nullable                           | Icon identifier                 |
| `budget`    | `real`    | nullable                           | Monthly budget limit            |
| `isDefault` | `integer` | NOT NULL, default `false`          | Boolean mode                    |
| `isActive`  | `integer` | NOT NULL, default `true`           | Boolean mode                    |
| `createdAt` | `integer` | NOT NULL, auto-generated           | Timestamp mode                  |
| `updatedAt` | `integer` | NOT NULL, auto-generated, on-update | Timestamp mode                 |

### `expenses`

| Column             | Type      | Constraints                        | Notes                                               |
| ------------------ | --------- | ---------------------------------- | --------------------------------------------------- |
| `id`               | `text`    | PRIMARY KEY, auto-generated UUID   |                                                     |
| `userId`           | `text`    | NOT NULL, FK → `user.id`          |                                                     |
| `categoryId`       | `text`    | NOT NULL, FK → `categories.id`    |                                                     |
| `description`      | `text`    | NOT NULL                           |                                                     |
| `amount`           | `real`    | NOT NULL                           | Positive value enforced at app level                |
| `date`             | `integer` | NOT NULL                           | Timestamp mode — transaction date                   |
| `recurrence`       | `text`    | NOT NULL, default `"none"`         | Enum: `none`, `weekly`, `monthly`, `yearly`         |
| `recurrenceEndDate`| `integer` | nullable                           | Timestamp mode                                      |
| `createdAt`        | `integer` | NOT NULL, auto-generated           | Timestamp mode                                      |
| `updatedAt`        | `integer` | NOT NULL, auto-generated, on-update | Timestamp mode                                     |

### `earnings`

| Column             | Type      | Constraints                        | Notes                                               |
| ------------------ | --------- | ---------------------------------- | --------------------------------------------------- |
| `id`               | `text`    | PRIMARY KEY, auto-generated UUID   |                                                     |
| `userId`           | `text`    | NOT NULL, FK → `user.id`          |                                                     |
| `description`      | `text`    | NOT NULL                           | Source name (e.g. "Salary")                         |
| `amount`           | `real`    | NOT NULL                           | Positive value enforced at app level                |
| `date`             | `integer` | NOT NULL                           | Timestamp mode — transaction date                   |
| `recurrence`       | `text`    | NOT NULL, default `"none"`         | Enum: `none`, `weekly`, `monthly`, `yearly`         |
| `recurrenceEndDate`| `integer` | nullable                           | Timestamp mode                                      |
| `createdAt`        | `integer` | NOT NULL, auto-generated           | Timestamp mode                                      |
| `updatedAt`        | `integer` | NOT NULL, auto-generated, on-update | Timestamp mode                                     |

## 7. Design Principles

- **Minimal & clean:** Whitespace-heavy, muted color palette, subtle shadows. Inspired by Linear, Vercel, Raycast.
- **Mobile-first responsive:** Design for small screens first, progressively enhance for tablet/desktop.
- **Consistent:** Use shadcn/ui components throughout. No custom UI unless necessary.
- **Accessible:** Proper ARIA labels, keyboard navigation, sufficient contrast ratios.
- **Smooth:** Framer Motion for page transitions, modal entrances, and micro-interactions (card hover, button press).

## 8. Currency Support

- User selects a currency once (onboarding or settings). Default: USD.
- All amounts displayed with the selected currency symbol/format.
- No currency conversion — purely display formatting.
- Supported currencies for v1: USD, BRL, EUR, GBP, CAD, AUD, JPY (extensible list).

## 9. Recurrence Logic

- When a recurring transaction is created, the system stores the base transaction with its recurrence rule.
- Recurring entries are **generated on read** (virtual expansion) for display on dashboard/history, not pre-created in the DB.
- The generation window: from the transaction start date up to the current date (or end date if set).
- Users edit/delete the **template** (base transaction). Individual occurrences cannot be independently modified in v1.

## 10. Route Structure

Uses TanStack Router layout routes. Public routes (`/`, `/login`, `/signup`) share a public layout. All authenticated routes live under `/app` with a shared auth layout that handles session checks, sidebar/nav, and the `QueryClient` provider.

**Public layout** (no auth required):

| Route     | Page         |
| --------- | ------------ |
| `/`       | Landing page |
| `/login`  | Login        |
| `/signup` | Signup       |

**Auth layout** (`/app`) — redirects to `/login` if unauthenticated:

| Route               | Page                  |
| ------------------- | --------------------- |
| `/app`              | Dashboard (index)     |
| `/app/expenses`     | Expenses management   |
| `/app/earnings`     | Earnings management   |
| `/app/transactions` | Transaction history   |
| `/app/categories`   | Category management   |
| `/app/settings`     | User settings         |

The `/app` layout route is responsible for:

- Checking auth session (redirect to `/login` if expired/missing)
- Rendering the shared app shell (sidebar navigation, header, main content area)
- Providing the app-level context (user info, queryClient)

## 11. Non-Functional Requirements

- **Performance:** Pages should load under 2s. Use TanStack Router loaders to `ensureQueryData` for instant page renders. React Query handles caching and background revalidation.
- **Security:** Server-side validation on all mutations. Auth middleware on protected routes. CSRF protection via BetterAuth.
- **Error handling:** Toast notifications for errors (shadcn toast). Form-level validation errors inline.
- **Loading states:** Skeleton loaders for dashboard cards/charts. Spinner for form submissions.

## 12. Out of Scope (v1)

- Email verification / password reset flow
- OAuth providers (Google, GitHub, etc.)
- Multi-currency conversion
- Shared/family accounts
- Notifications / reminders
- Data import (CSV, bank sync)
- PWA / native mobile
- Dark mode toggle (could be added easily later via shadcn theming)

## 13. Future Considerations (v2+)

- Email verification & password reset
- Dark mode
- CSV export from transaction history
- Recurring transaction individual occurrence editing
- Spending insights & AI-powered suggestions
- Data import from bank statements
- PWA support for mobile home screen
