## Agent skills

### Git (push, PR, `gh`)

This repo uses [`.envrc`](.envrc) to set `GH_TOKEN` for the correct GitHub account. Agent shells do not load direnv automatically. Do **not** fix auth with `gh auth switch` or other global account changes.

Before **`git push`**, **`gh pr create`**, or any other remote Git/`gh` command:

1. Run from a direnv-loaded shell, **or**
2. Prefix the command: `source .envrc && …` (e.g. `source .envrc && git push -u origin HEAD`)

### Domain docs

Single-context layout — `CONTEXT.md` at the repo root, with `docs/concepts/`, `docs/adr/`, and `docs/guides/` underneath. See [`docs/domain.md`](docs/domain.md) for the full reading order and conventions.
