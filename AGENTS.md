## Agent skills

### Git (push, PR, `gh`)

This repo uses [`.envrc`](.envrc) to set `GH_TOKEN` for the correct GitHub account. Agent shells do not load direnv automatically. Do **not** fix auth with `gh auth switch` or other global account changes.

Before **`git push`**, **`gh pr create`**, or any other remote Git/`gh` command:

1. Run from a direnv-loaded shell, **or**
2. Prefix the command: `source .envrc && …` (e.g. `source .envrc && git push -u origin HEAD`)

### Domain docs

Single-context layout — `CONTEXT.md` at the repo root, with `docs/concepts/`, `docs/adr/`, and `docs/guides/` underneath. See [`docs/domain.md`](docs/domain.md) for the full reading order and conventions.

### Design context (Impeccable)

UI work should read these before designing or polishing surfaces:

- [`PRODUCT.md`](PRODUCT.md) — register (`product`), users, brand personality, anti-references, design principles
- [`DESIGN.md`](DESIGN.md) — tokens, typography, components, do's/don'ts (Google Stitch format)
- [`.impeccable/design.json`](.impeccable/design.json) — sidecar metadata (color display names, implementation notes)

Domain language stays in `CONTEXT.md`; design strategy and visual spec live in the files above. Invoke Impeccable via the skill in `.agents/skills/impeccable/` (e.g. critique, polish, layout on a specific target).

### Dependency versions

Dependencies in `package.json` are **pinned to exact versions** (no `latest` or `^` ranges). Do not bump packages casually — especially not in drive-by “cleanup” PRs.

**Why:** Supply-chain safety. Recent npm attacks make floating ranges risky; pinned versions mean installs are reproducible and upgrades are deliberate.

**TanStack Start / Router ceiling:** `@tanstack/react-start` (`1.167.16`) and `@tanstack/react-router` (`1.168.10`) are intentionally behind current releases. Newer versions trigger a production-only bug — `Server function info not found` on routes that call server functions (e.g. `/login` via `useAuth` / session query). Works in `pnpm dev`; breaks after `pnpm build` + preview/prod. Upstream: [TanStack/router#7213](https://github.com/TanStack/router/issues/7213).
