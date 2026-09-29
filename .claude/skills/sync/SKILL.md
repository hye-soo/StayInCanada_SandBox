---
name: sync
description: Preflight check before starting work — fetches remote state, verifies the current branch is healthy and up to date with its tracking branch, and lists any uncommitted (dirty) files. Use when the user runs /sync or asks to check repo state before starting a task.
---

# /sync — Preflight check

1. Run `git fetch` to update remote-tracking refs.
2. Run `git status -sb` to get the current branch and its ahead/behind
   counts relative to its upstream. If there is no upstream tracking
   branch, note that instead of ahead/behind counts.
3. Run `git status --porcelain` to list any dirty (uncommitted) files —
   staged, modified, or untracked. Group them by state.
4. Report a short summary in this form:

   ```
   Branch: <name> (tracking <remote/branch> | no upstream)
   Ahead/behind: <n> ahead, <m> behind
   Dirty files: <count> — <list, or "none">
   ```

5. If the branch is behind its remote, suggest (but do not run) a pull
   or rebase — let the user decide. Do not commit, stash, or discard
   anything as part of this check.
