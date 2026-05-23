---
name: pr
description: >
  Inspect the current feature branch against main, draft a concise pull request,
  push if needed, and open it on GitHub. Use when the user invokes /pr or asks
  to create a pull request for the current branch.
disable-model-invocation: true
---

# Pull request

Open a GitHub pull request for the current branch. Keep title and body short — same spirit as `/commit`.

## 1. Preconditions

**Trunk branches:** `main`, `dev`, `master`, `develop`

If on trunk, stop and suggest `/commit` first to create a feature branch and commit changes.

If the working tree is dirty, stop and suggest committing or stashing first.

## 2. Inspect

Run in parallel:

```bash
git branch --show-current
git status --short
git rev-parse --abbrev-ref @{upstream} 2>/dev/null || echo "no upstream"
git log main..HEAD --oneline
git diff main...HEAD --stat
git diff main...HEAD
```

Read **all commits** on the branch (not just the latest). Summarize the change in one or two sentences.

## 3. Draft

Propose before creating anything:

**Title** — one line, scannable. Derive from commits:
- Single commit → reuse or lightly expand the commit subject
- Multiple commits → summarize the overall change

Match recent repo style (conventional prefix or plain descriptive title both appear here).

**Body** — minimal template:

```md
## Summary
- <what changed and why, 1–3 bullets>
```

Skip filler, issue links, and long narratives unless the user asks. Show the draft and wait for confirmation (or tweaks).

## 4. Push

If the branch has no upstream or is ahead of remote:

```bash
git push -u origin HEAD
```

Never force-push to `main` or `master`. Warn before any force-push.

## 5. Create

Use `gh` for all GitHub operations:

```bash
gh pr create --title "feat: add TanStack Form TextInput infra" --body "$(cat <<'EOF'
## Summary
- Add reusable TextInput field wired to TanStack Form
- Refactor login route to use the new form infra

EOF
)"
```

Return the PR URL to the user.

## 6. Report

Tell the user:

- PR URL
- Base branch (default `main`)
- Commit count included
- Anything still unpushed or uncommitted

## Safety

- Never update git config or skip hooks
- Do not merge, close, or edit unrelated PRs unless asked
- Do not push secrets or commit `.env` files
