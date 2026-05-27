---
name: commit
description: >
  Inspect working-tree changes, use the right feature branch (never trunk),
  and commit with a short conventional message. Use when the user invokes /commit
  or asks to commit current changes.
disable-model-invocation: true
---

# Commit

Commit the current working tree on a **feature branch** — never on trunk.

**Trunk (never commit here):** `main`, `dev`, `master`, `develop`

## 1. Inspect

Run in parallel:

```bash
git branch --show-current
git status --short
git diff
git diff --cached
git log -5 --oneline
```

Read the output. Summarize what changed in one or two sentences.

## 2. Branch check

Use this order every time.

### A. On trunk → new branch

1. Propose a **descriptive kebab-case branch name** from the changes — short, scannable, no ticket IDs unless the user uses them elsewhere.
   - Good: `add-shadcn-ui-primitives`, `docs-agents-git-guard`
   - Avoid: `my-branch-abc`, `updates`, `wip`
2. Show the name and **wait for confirmation** (or a tweaked name).
3. Create and switch: `git checkout -b <branch-name>`

### B. On a feature branch → is it still the right branch?

Stay on the current branch **only if both** are true:

1. **Not fully merged** into `main` (see below).
2. **Matches the work** — branch name/topic fits the diff (e.g. don’t commit `AGENTS.md`-only changes on `add-date-input` after that PR merged).

**Start a fresh branch** when **either** is true:

- The branch is **already merged** into `main`.
- The branch **does not match** the current changes (unrelated or leftover from other work).

Fresh-branch steps:

```bash
git fetch origin
git checkout main
git pull origin main
```

Then propose a new kebab-case branch name, **wait for confirmation**, and:

```bash
git checkout -b <branch-name>
```

Uncommitted changes usually carry over when switching; if Git blocks checkout, stop and ask the user (stash/commit — **NEVER** discard without confirmation).

**Check “already merged”** (after `git fetch origin`):

```bash
git merge-base --is-ancestor HEAD origin/main && \
  [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]
```

Exit code `0` → this branch is fully merged into `origin/main`; use a new branch.

**Check “matches the work”** — use judgment from the branch name, `git log main..HEAD`, and the diff. Examples of **mismatch**:

- Merged feature branch (e.g. `add-date-input`) but changes are only `AGENTS.md` / agent docs.
- Branch is for feature A; diff only touches unrelated area B.

When in doubt, prefer **main → pull → new branch**.

### C. Good feature branch → commit here

If not on trunk and section B says stay, say which branch you’re using and continue to §3.

## 3. Commit message

Draft one **short** line using [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <what changed>
```

- Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`
- Lowercase subject, no trailing period, under ~72 chars
- Match recent repo style from `git log`

Examples:

- `chore: add shadcn UI primitives`
- `docs: add agent git guard to AGENTS.md`
- `feat: add cash balance reconciliation form`

Show the proposed message before committing.

## 4. Commit

Follow git safety rules:

- Never update git config, skip hooks, or force-push
- Never commit `.env`, credentials, or other secrets — warn if present
- For `git push` / `gh` in this repo, load auth first: `source .envrc && …` (see `AGENTS.md`)
- Stage only files relevant to this change
- Commit with a HEREDOC:

```bash
git add <paths>
git commit -m "$(cat <<'EOF'
chore: add shadcn UI primitives
EOF
)"
git status
```

Do **not** push unless the user explicitly asks.

## 5. Report

Tell the user:

- Branch name (new or existing)
- Whether you synced `main` and created a new branch (and why)
- Commit hash and message
- Whether anything remains unstaged or untracked
