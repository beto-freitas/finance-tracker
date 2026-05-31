---
name: Finance Tracker
description: Precise, trustworthy personal finance UI for cross-currency cash tracking
colors:
  background: "#1a1c1a"
  foreground: "#f1f1ee"
  card: "#2f312f"
  card-foreground: "#f1f1ee"
  primary: "#9fe870"
  primary-foreground: "#163300"
  primary-muted: "#91d963"
  secondary: "#3d3f3d"
  secondary-foreground: "#e2e3e0"
  muted: "#2f312f"
  muted-foreground: "#a8a8a6"
  accent: "#3d3f3d"
  accent-foreground: "#f1f1ee"
  destructive: "#ff6b6b"
  destructive-foreground: "#ffffff"
  warning: "#ffd11a"
  border: "#4a4d48"
  input: "#4a4d48"
  ring: "#9fe870"
  chart-1: "#9fe870"
  chart-2: "#91d963"
  chart-3: "#2ead4b"
  chart-4: "#acf67c"
  chart-5: "#c8c6c1"
  sidebar: "#2f312f"
  sidebar-foreground: "#f1f1ee"
  sidebar-primary: "#9fe870"
  sidebar-primary-foreground: "#163300"
typography:
  body:
    fontFamily: "Outfit, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Outfit, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.25
  title:
    fontFamily: "Outfit, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1
rounded:
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  pill: "1.5rem"
spacing:
  page: "1.5rem"
  section: "1rem"
  card: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 1rem"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 1rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 1rem"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.sm}"
    padding: "0.25rem 0.75rem"
    height: "2.25rem"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.lg}"
    padding: "1.5rem"
---

# Design System: Finance Tracker

## 1. Overview: The Clear Ledger

**Creative North Star: "The Clear Ledger"**

Finance Tracker's visual system exists so numbers feel trustworthy and actions feel immediate. Design serves the task: a user checking whether they'll have enough after bills, logging an expense, or adjusting a source should read the screen once and act without hunting through decoration. The aesthetic is Nubank-adjacent in hierarchy (you know where things are and why), not in marketing gloss.

The system is **dark-first** with a full light palette defined in code. Dark mode is the current default while theme switching is being built; both themes must stay in parity. Surfaces are mostly flat and tonal; green accent marks primary actions and positive focus, not brand theater.

**Implementation note:** Tokens and components currently follow the shadcn + Tailwind v4 structure in `src/styles.css` and `src/components/ui/`. This is the working baseline. A future token/component rewrite is under consideration; until then, extend what exists rather than introducing a parallel system.

**Key Characteristics:**

- Dark-first product UI with restrained green accent
- Single sans family (Outfit), small/medium type scale tuned for desktop density
- Flat surfaces with hairline borders and light shadows only on elevation
- shadcn component primitives as the current implementation layer
- Data surfaces chosen by meaning (lists, summaries, inline detail), not card grids by default

## 2. Colors: Signal on Charcoal

Palette character: warm charcoal neutrals with a manually chosen lime-green accent (`#9fe870`). Reads as calm fintech trust (Wise/Nubank lane), not navy/gold enterprise or AI-slop cream. Light-mode equivalents live in `:root`; dark values below are canonical while dark-first shipping continues.

### Primary

- **Signal Green** (`#9fe870`): Primary actions, focus rings (dark), selected calendar dates, loading spinner accent, positive emphasis. Chosen deliberately; open to refinement but must stay trustworthy, not neon.
- **Forest Ink** (`#163300`): Text and icons on primary fills.
- **Muted Sage** (`#91d963` dark / `#2f6c00` light): Secondary green emphasis — sidebar logo badge (light), ring color (light), chart series.

### Neutral

- **Charcoal Base** (`#1a1c1a` dark / `#f9f9f6` light): Page background.
- **Soft Ink** (`#f1f1ee` dark / `#1a1c1a` light): Primary text.
- **Elevated Surface** (`#2f312f` dark / `#ffffff` light): Cards, popovers.
- **Muted Text** (`#a8a8a6` dark / `#868685` light): Descriptions, placeholders, secondary labels.
- **Sage Edge** (`#4a4d48` dark / `#c1cab5` light): Borders and input strokes.

### Semantic

- **Alert Red** (`#ff6b6b` dark / `#ba1a1a` light): Destructive actions, validation errors.
- **Overdue Amber** (`#ffd11a`): Warning states — reserved for overdue receipts/payments and cautionary UI. Same hue in both themes.

### Chart

- **chart-1 … chart-5**: Green family + neutral gray for cash-flow visualizations. Prefer these over inventing new series colors.

### Named Rules

**The One Accent Rule.** Signal Green appears on primary actions, focus, and selective emphasis — not as page-wide fill or decorative gradient. If green covers more than ~10% of a screen, reconsider hierarchy.

**The Parity Rule.** When theme switching lands, every semantic token must have intentional light and dark values. Do not ship a token that only works in one theme.

## 3. Typography

**Body Font:** Outfit (Google Fonts, variable 100–900)
**Display / Label / Title Font:** Outfit (same family — weight contrast only)

**Character:** Geometric sans, friendly but precise. One family keeps the product register calm; hierarchy comes from size and weight, not type pairing.

### Hierarchy

- **Page title** (browser default / TBD): Route `<h1>` elements are not yet on a typed scale. When defined, cap display size for product UI (no hero-scale clamp on app pages).
- **Title** (600, 1rem, leading-none): Card titles, sidebar app name.
- **Body** (400, 0.875rem on md+, 1rem on small viewports for inputs, line-height ~1.5): Paragraphs, form values, list content. Cap prose at 65–75ch where long copy appears.
- **Label** (500, 0.875rem): Field labels, buttons, nav items.
- **Meta** (400, 0.75rem, muted-foreground): Sidebar email, helper timestamps.

### Named Rules

**The Product Scale Rule.** No fluid display clamp on authenticated app surfaces. Page titles should be legible and compact, not marketing-sized.

## 4. Elevation

Depth is conveyed primarily through **surface color steps** (background → card → accent hover) and **1px borders**, not stacked drop shadows. Shadows are sparse and functional.

### Shadow Vocabulary

- **Hairline** (`shadow-xs`): Inputs, outline buttons — subtle edge definition only.
- **Lift** (`shadow-sm`): Cards, floating sidebar variant — single step of elevation.
- **Overlay** (`shadow-md`): Popovers, combobox menus, dropdowns — floating above content.
- **Sidebar outline** (`0 0 0 1px var(--sidebar-border)`): Outline nav variant — border simulation, not blur.

Focus depth uses **3px ring** at 50% opacity (`ring-ring/50`), not shadow stacking.

### Named Rules

**The Flat-By-Default Rule.** Surfaces at rest are flat. Shadow appears on overlays and optional card lift — never paired with a heavy border on the same element as decoration.

## 5. Components

### Buttons

- **Shape:** `rounded-md` (8px / `--radius-sm`)
- **Primary:** Signal Green fill, Forest Ink text; hover `primary/90`
- **Outline:** Background fill, border, `shadow-xs`; hover accent surface
- **Ghost / Secondary:** Muted fills or transparent with accent hover
- **Destructive:** Alert Red fill
- **Focus:** 3px ring using `--ring`
- **Sizes:** Default height 36px (`h-9`); compact and icon variants available

### Cards / Containers

- **Corner Style:** `rounded-xl` (16px)
- **Background:** Elevated Surface (`--card`)
- **Shadow Strategy:** `shadow-sm` + border — use when grouping related content, not as the default page layout
- **Internal Padding:** 24px horizontal (`px-6`), 24px vertical section gap
- **Philosophy:** Cards are for grouped, bounded content (a reconciliation summary, a form section). Full pages should not devolve into uniform card grids.

### Inputs / Fields

- **Style:** 36px height, sage border, transparent bg (dark: `input/30`), `shadow-xs`
- **Focus:** Border shifts to ring color + 3px ring
- **Error:** Destructive border + ring; message in `text-sm text-destructive`
- **Field layout:** Vertical by default; `gap-7` between field groups

### Navigation

- **App shell:** Left sidebar, 16rem expanded / 3rem icon-collapsed, collapsible with ⌘B
- **Nav items:** `text-sm`, Lucide icons 16px, active state via `sidebar-accent` background
- **Logo badge:** Rounded-lg square with primary-muted (light) or Signal Green (dark) background
- **User menu:** Dropdown from footer — account, theme (switching planned), logout

### Overlays

- Popover, dropdown, combobox, tooltip: standard shadcn patterns — `bg-popover`, border, `shadow-md`, short fade/zoom animation via `tw-animate-css`

## 6. Do's and Don'ts

### Do:

- **Do** use semantic tokens from `src/styles.css` (`bg-background`, `text-muted-foreground`, etc.) so both themes stay wired.
- **Do** choose the lightest structure that fits the data — a list, a summary row, or inline detail beats a card when the content is simple.
- **Do** use Signal Green for one primary action per view where possible.
- **Do** use Overdue Amber for warning/overdue states once those flows ship.
- **Do** keep desktop density comfortable — `p-6` page padding, clear vertical rhythm between sections.
- **Do** respect `prefers-reduced-motion` when adding animations (baseline not yet implemented in CSS).

### Don't:

- **Don't** default every page to identical card grids or data-table layouts — hierarchy over spreadsheet cosplay.
- **Don't** use generic fintech marketing copy styling (hero metrics, gradient heroes, eyebrow kickers on every section).
- **Don't** require multi-page flows for single actions — prefer dialogs and focused surfaces (per PRODUCT.md).
- **Don't** pair `border` + wide soft `box-shadow` on the same element as decoration.
- **Don't** introduce a second parallel token system alongside shadcn vars without an explicit migration plan.
- **Don't** use purple gradients, glassmorphism, or cream/warm paper backgrounds as the default page fill.
- **Don't** assume mobile-first layout — desktop is the primary target for this repo.
