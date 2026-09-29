---
name: plan
description: This project's planning phase for a feature — reads docs/ for context (especially docs/DECISIONS.md and docs/IMPLEMENTATION_PLAN.md), asks clarifying questions, writes/updates docs/IMPLEMENTATION_PLAN.md as an ordered checkable list, and appends real architectural decisions to docs/DECISIONS.md. Distinct from Claude Code's own design/plan-mode tooling — use when the user runs /plan or asks to plan a feature for this project.
---

# /plan — Planning phase

1. Read everything under `docs/` for context. Prioritize
   `docs/DECISIONS.md` and `docs/IMPLEMENTATION_PLAN.md` if they exist;
   if `docs/` doesn't exist yet, note that this is a fresh plan.
2. If the feature being planned is ambiguous (unclear scope, missing
   requirements, conflicting with an existing decision in
   DECISIONS.md), ask the user clarifying questions before writing
   anything. Don't guess at scope.
3. Create or update `docs/IMPLEMENTATION_PLAN.md`:
   - An ordered, checkable list (`- [ ] step`) of concrete steps.
   - Group steps logically into phases (e.g. Data layer, API, UI).
   - If the file already exists, preserve completed (`- [x]`) items
     and merge in new/changed steps rather than rewriting it from
     scratch.
4. If a real architectural decision was made during this planning
   session (a tradeoff, a chosen approach, a rejected alternative),
   append a new dated entry to `docs/DECISIONS.md`:
   ```
   ## YYYY-MM-DD — <short title>
   **Context:** ...
   **Decision:** ...
   **Alternatives considered:** ...
   ```
   Never rewrite, reorder, or delete existing entries — append only.
5. Confirm with the user before considering the plan final.
6. Once confirmed, ask whether to annotate the plan's items with a
   tests-first (TDD) reminder per CLAUDE.md's Development Process, or
   leave TDD enforcement to `/done` at validation time.
