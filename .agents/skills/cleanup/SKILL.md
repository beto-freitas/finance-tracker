---
name: cleanup
description: >
  Find merged, fully-synced feature branches (local and remote), delete
  user-approved ones, and switch to an updated main. Use when the user
  invokes /cleanup after merging a PR, or asks to remove stale branches.
disable-model-invocation: true
---

# Cleanup

Post-merge housekeeping. Pairs with `/commit` → `/pr` → merge → `/cleanup`.

Finds feature branches safe to delete, removes only what the user approves, ends on `main`.

## 1. Preconditions

If the working tree is dirty, stop and suggest committing or stashing first.

## 2. Fetch state

Run in parallel:

```bash
git fetch origin --prune
git branch --show-current
git branch -vv
git branch -r
gh pr list --state merged --limit 50 --json headRefName,mergedAt,title
```

Then update local main:

```bash
git checkout main
git pull origin main
```

**Trunk branches (never delete):** `main`, `dev`, `master`, `develop`, and their `origin/*` counterparts.

## 3. Classify branches

For each **local** feature branch and each **remote** feature branch (`origin/*`, excluding trunk):

| Check | How |
|-------|-----|
| Merged into main | `headRefName` appears in merged `gh pr list`, **or** `git merge-base --is-ancestor <branch> origin/main` |
| No commits ahead of main | `git rev-list --count origin/main..<branch>` is `0` **or** merged PR exists (squash merges fail ancestor/ahead checks — trust `gh`) |
| Local fully synced | No upstream → OK if merged PR exists. Has upstream → local tip equals `origin/<branch>` |

Mark **safe** when merged **and** synced. Mark **skip** with reason when not:

- Unmerged / open work (`N` commits ahead of `origin/main`)
- Local ahead of or behind remote (unpushed or unpulled commits)
- Trunk branch

Cross-reference merged PRs from `gh` — this is the source of truth for squash-merged branches.

## 4. Present

Show a concise table:

```
Safe to delete
  local   feat/form-text-input-infra   merged PR #12 · synced
  remote  origin/feat/form-text-input-infra   merged PR #12

Skipped
  local   feat/wip-thing   3 commits ahead of main · not merged
```

List defaults: all **safe** branches pre-selected for deletion. **Wait for approval** — user can exclude branches or ask for tweaks before anything is deleted.

## 5. Delete (approved only)

For each approved branch:

**Local** — use `-d` when fully merged; use `-D` when `gh` confirms a squash-merged PR ( `-d` will refuse):

```bash
git branch -d feat/form-text-input-infra   # or -D if squash-merged
```

**Remote** — delete via git (GitHub CLI confirms merge; git removes the ref):

```bash
git push origin --delete feat/form-text-input-infra
```

Skip remote deletion if the ref is already gone. Run `git fetch origin --prune` when finished.

## 6. Report

Tell the user:

- Deleted local branches
- Deleted remote branches
- Skipped branches and why
- Confirm current branch is `main` and up to date with `origin/main`

## Safety

- Never delete trunk branches or the current branch without switching to `main` first
- Never delete branches the user did not approve
- Never force-push, update git config, or skip hooks
- Never use `-D` unless `gh` confirms the branch was merged or `git branch -d` succeeds
- Do not close or merge PRs — this skill only cleans up after merge
