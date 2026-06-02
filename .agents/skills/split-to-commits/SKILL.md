---
name: split-to-commits
description: >-
  Analyze unstaged and untracked changes, group them into logical commit
  chunks, and output copy-paste git add/commit commands without running them.
  Use when the user asks to split work into commits, plan multiple commits,
  chunk unstaged changes, or organize a dirty working tree before committing.
---

# Split to commits

Turn one dirty working tree into a **commit plan** the user runs themselves.

## Hard rules

- **Never** run `git add`, `git commit`, `git stash`, branch switches, push, or any command that changes git state.
- **Never** discard work. No destructive git unless the user explicitly asks elsewhere.
- Stage only **named paths** per chunk — no `git add .` / `git add -A`.
- Mixed-concern files → suggest `git add -p <path>` and which hunks go in which chunk.
- Warn and **exclude** paths that may contain secrets (`.env`, keys, credentials).

Read-only inspection is fine: `git status`, `git diff`, `git diff --cached`, `git log -10 --oneline`, and reading files when the diff is unclear.

## 1. Inspect

```bash
git status --short
git diff
git diff --cached
git log -10 --oneline
```

Scope: **unstaged** and **untracked** (`??`). List **staged** separately unless the user asked to replan all changes. Use **chat history** when intent is not obvious from the diff.

## 2. Group into chunks

Split by concern, not folder alone:

- **docs** — `docs/`, `CONTEXT.md`, ADRs
- **feat** — new feature, schema, route scaffold (WIP is OK)
- **fix** — behavior correction in existing code
- **test** — tests for a slice (or bundle with that slice if tiny)
- **chore** — deps, tooling, lockfiles
- **refactor** — move/rename without behavior change

Rules: one concern per commit; order chunks so each would build (types → feature → docs); keep tightly coupled files together; prefer fewer coherent chunks unless the user wants max granularity.

Messages: [Conventional Commits](https://www.conventionalcommits.org/), match `git log` — `type(scope): subject`, lowercase, no period, ~72 chars.

## 3. Report

1. **Summary** (2–4 sentences): overall work, chunk count, run order.
2. **Per chunk** — label, rationale, then:

```bash
git add <every path in this chunk>

git commit -m "$(cat <<'EOF'
<type>(<scope>): <subject>
EOF
)"
```

3. **Order** — e.g. “Run chunks 1 → 2 → 3.”
4. **Leftovers** — unassigned paths and why.
5. Remind: use `.agents/skills/commit/SKILL.md` for branch checks when executing — this skill only plans.

## 4. When to ask

Only if a file spans two features and hunk boundaries are unclear, or staged vs unstaged ordering is ambiguous. Never ask “approve to run git” — you do not run git.

## Output shape (multi-chunk)

```text
### Chunk 1: doc updates — docs: align income concept with schema

CONTEXT and income guide only.

git add CONTEXT.md docs/concepts/income.md
git commit -m "$(cat <<'EOF'
docs: align income concept with schema
EOF
)"

### Chunk 2: cash account guard — feat(cash-accounts): require account before income setup

git add src/features/cash-accounts/lib/require-cash-account.ts ...
git commit -m "$(cat <<'EOF'
feat(cash-accounts): require account before income setup
EOF
)"
```

Repeat for each chunk; end with run order.
