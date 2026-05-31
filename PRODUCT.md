# Product

## Register

product

## Users

Primary user today is the builder: a Brazilian managing personal finances with offshore income (invoiced in foreign currency, settled in BRL) who wants a single place to track everything — rent, taxes, bills, streaming, food, and ad-hoc spending.

The app also serves others in the same situation: Brazilians receiving offshore income who need clarity across currencies without juggling spreadsheets or generic finance apps.

**Usage context:** Desktop-first. Opened in four main scenarios:
- Recording an expense right after it happens
- Projecting cash balance ("Will I have enough after bills on the 30th?")
- Glancing at current balance or light planning
- Setting up or adjusting income sources and expense sources

**Primary task per visit:** Usually one focused action — add something, check a number, or configure a source — not browsing.

## Product Purpose

Finance Tracker is personal financial management for tracking money in, money out, and projected cash position over time. Success means the user trusts every number on screen matches their real position and feels in full control of their expenses, projections, and overrides.

The landing page may evolve later; the core product lives in the authenticated app where design serves clarity and task completion, not storytelling.

## Brand Personality

Precise, trustworthy, no-nonsense.

Voice is direct and honest — no hype, no generic fintech cheerleading. The app explains what numbers mean and what will happen if you act, without overselling or hiding complexity the user needs to see.

## Anti-references

- Cluttered interfaces with generic fintech phrases ("Take control of your finances", "Empower your wealth journey")
- Multi-screen flows for simple tasks — e.g. adding an expense should not require navigating three pages, creating labels in separate steps, etc. Prefer focused surfaces (dialog, inline) so the user does one thing at a time
- Grid/table-heavy layouts on every page — data belongs where it earns its place, not as default scaffolding
- Generic fintech aesthetics (navy + gold, hero metrics, dashboard vanity stats)
- AI-slop SaaS tells (cream backgrounds, purple gradients, eyebrow kickers, identical card grids)
- Spreadsheet cosplay (dense grids with no hierarchy or purpose)
- Crypto-bro / gamified finance dashboards
- Over-designed consumer finance apps (Mint-style clutter, upsell banners, noise)

## Design Principles

1. **Numbers earn trust.** Every displayed balance, projection, and receipt must be traceable to something the user understands. If a number could surprise them, the UI should show why.

2. **One thing at a time.** Simple actions get focused flows — a dialog to add an expense, not a wizard across pages. Reduce navigation depth for common tasks.

3. **Hierarchy over default density.** Structure like Nubank: the user knows where things are and *why* they live there. Not every screen is a data table.

4. **Control is visible.** Overrides, overdue flags, assumed vs actual amounts — the user sees what the app is doing and can change it. Projections are tools, not oracle pronouncements.

5. **Clarity serves the task.** Design decisions prioritize reading numbers quickly and acting confidently, not decoration or brand performance.

## Accessibility & Inclusion

- Sensible defaults; no heavy accessibility certification requirements beyond baseline good practice
- Respect `prefers-reduced-motion` for all animations and transitions
- UI in English for now; Portuguese (pt-BR) planned as the second language — copy and layout should not assume English-only string lengths forever
- Desktop-primary for this repo; mobile and WhatsApp chatbot are future surfaces, not current design constraints
