---
name: done
description: Validation gate to run before wrapping up work — auto-detects scope (quick/standard/project) from branch name, diff size, and docs/IMPLEMENTATION_PLAN.md, then runs tests/lint and does the matching commit/push/PR/handoff workflow. Use when the user runs /done or asks to wrap up, ship, or finish their change.
---

# /done — Validation gate

1. Detect scope:
   - Run `git branch --show-current` and `git diff --stat` (against
     the base branch) to gauge size.
   - Check whether `docs/IMPLEMENTATION_PLAN.md` exists and has
     unchecked (`- [ ]`) items.
   - **Quick**: on `main`/`master`, small diff, no implementation plan.
   - **Standard**: on a feature branch, medium-sized diff.
   - **Project**: an implementation plan with unchecked items exists,
     regardless of branch — this scope adds to Standard, it doesn't
     replace it.
2. Always run the project's tests and lint first, regardless of scope.
   Stop and report failures instead of proceeding — never skip this
   step.
3. **Quick**: commit the change, push to the current branch, then
   check CI status and report it.
4. **Standard** (includes everything in Quick, but opens a PR instead
   of pushing straight to main): commit, push, open a PR, wait on CI,
   prompt the user to request code review, and add a changelog entry.
5. **Project** (everything in Standard, plus): write a short handoff
   note (what was done, what's left) and update
   `docs/IMPLEMENTATION_PLAN.md`, checking off completed items.
6. Before pushing, opening a PR, or committing, confirm with the user
   per standard git-safety practice — don't push or open PRs silently.
