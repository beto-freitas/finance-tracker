<!-- intent-skills:start -->
## Skill Loading

Before substantial work:
- Skill check: run `npx @tanstack/intent@latest list`, or use skills already listed in context.
- Skill guidance: if one local skill clearly matches the task, run `npx @tanstack/intent@latest load <package>#<skill>` and follow the returned `SKILL.md`.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

# Finance Tracker

Personal finance web app built with TanStack Start, BetterAuth, Drizzle ORM v1, and Turso (libSQL/SQLite edge).

## Project Status

Early stage. The project has been bootstrapped with TanStack Start, TanStack Query, Tailwind CSS v4, and Biome.

Current implemented routes include:

- `/` landing page
- `/login` auth page
- `/signup` auth page
- `/app` authenticated app segment
- `/app/dashboard` initial authenticated dashboard page

App auth and routing now use:

- centralized post-auth redirect helper (`src/lib/auth-redirect.ts`)
- query-subscribed auth checks in app layout routes
- explicit route error boundaries at root and app scope

All features described in this file are to be built according to the PRD (`docs/prd.md`).

Implementation guidance docs:

- `docs/base.md` explains the purpose and usage of the `docs/` directory.
- `docs/database-schema.md` defines Drizzle ORM v1 schema, relation, foreign key, cascade, and DB utility conventions.
- `docs/server-action.md` defines form + server-action patterns, including schema layering and options-factory usage for hooks and loader/cache flows.
- `docs/routing-auth-and-errors.md` defines route structure, auth guard, redirect, and route-level error boundary conventions.
