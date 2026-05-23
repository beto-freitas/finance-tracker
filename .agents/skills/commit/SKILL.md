---
name: commit
description: >
  Inspect working-tree changes, recommend a descriptive branch when on trunk
  (main/dev), and commit with a short conventional message. Use when the user
  invokes /commit or asks to commit current changes with a branch check first.
disable-model-invocation: true
---

# Commit

Commit the current working tree. On trunk branches, recommend a feature branch first — never commit directly to `main`, `dev`, `master`, or `develop`.

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

**Trunk branches:** `main`, `dev`, `master`, `develop`

If the current branch is trunk:

1. Propose a **descriptive kebab-case branch name** derived from the changes — short, scannable, no ticket IDs unless the user uses them elsewhere.
   - Good: `add-shadcn-ui-primitives`, `fix-reconciliation-date-validation`
   - Avoid: `my-branch-abc`, `updates`, `wip`
2. Show the recommendation and **wait for confirmation** (or a tweaked name) before creating the branch.
3. Create and switch: `git checkout -b <branch-name>`

If already on a appropriately named feature branch, say so and skip branch creation.

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
- `feat: add cash balance reconciliation form`

Show the proposed message before committing.

## 4. Commit

Follow git safety rules:

- Never update git config, skip hooks, or force-push
- Never commit `.env`, credentials, or other secrets — warn if present
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
- Commit hash and message
- Whether anything remains unstaged or untracked
