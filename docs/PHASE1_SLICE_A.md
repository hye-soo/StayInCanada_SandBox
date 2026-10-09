# Phase 1, Slice A — Sandbox Build Report

Branch: `hye-sandbox-v1`. Scope: checklist data model, API route, and a
read-only checklist page only — no auth, no storage provider, no
questionnaire. Built TDD-style (red → green per piece of logic).

## What was built

- `lib/types.ts` — `Client`, `AppUser` (includes a `role` field,
  unused for now), `ChecklistItem`, the 5-state `ChecklistItemStatus`
  (required / submitted / under_review / changes_required / approved)
- `lib/checklist-store.ts` — `ChecklistStore` interface + an in-memory
  implementation seeded with 4 placeholder Student-visa checklist
  items (each with a "why this is needed" note). Swappable later for
  a Firebase/other-backed store without touching callers.
- `lib/current-client.ts` — `getCurrentClient()` stub returning a
  hardcoded mock client. The one place real auth plugs in later.
- `lib/get-current-client-checklist.ts` — combines the two above; this
  is what's actually unit-tested, and what the route calls.
- `app/api/checklist/route.ts` — thin GET handler, no logic of its own
- `app/checklist/page.tsx` — minimal read-only page: checklist items,
  status badges, "why needed" text

## Tooling decisions

- Tests run on Node's built-in test runner (`node --test`, via
  `npm test`) — Node 25 runs TypeScript natively, so no test framework
  dependency was added.
- `tsconfig.json`: added `allowImportingTsExtensions` so explicit
  `.ts` import extensions (required by Node's native ESM resolution)
  don't conflict with Next's bundler-style module resolution.
- `package.json`: added `"type": "module"` and a `test` script.

## Verified

- 4 unit tests pass (`npm test`)
- `tsc --noEmit` clean, `eslint` clean, `next build` succeeds
- Hit both `/api/checklist` and `/checklist` against a live dev
  server — both returned/rendered real seeded data correctly

## Assumptions made (not decided — mirror open questions in
docs/IMPLEMENTATION_PLAN.md)

- Auth/identity: fully stubbed via `getCurrentClient()`; no real
  login, no role enforcement
- Storage: in-memory `Map`, resets on server restart; not
  Firebase/AWS S3/anything persistent
- Checklist content (the 4 documents + "why needed" text) is
  placeholder, not confirmed with the client
- No retainer-gating, no PII access control — any request currently
  sees the mock client's data
- `role` field exists on the user model but nothing reads it yet

## Coverage vs docs/MVP.md and docs/IMPLEMENTATION_PLAN.md

**Covered:**

| Item | Source |
| --- | --- |
| Document Checklist (static, seeded, read-only, single visa type) | MVP.md § Document Collection |
| Document Status — 5-state model, rendered as a badge (no transitions driven yet) | MVP.md § Document Collection |
| Data model for clients/visa types/checklists | IMPLEMENTATION_PLAN.md Phase 1 |
| Seed the Student visa checklist | IMPLEMENTATION_PLAN.md Phase 1 |
| API route to fetch checklist with item status | IMPLEMENTATION_PLAN.md Phase 1 |
| Minimal client-facing checklist page with "why needed" notes | IMPLEMENTATION_PLAN.md Phase 1 |

**Not covered:**

- Foundation: Login (Client/Staff/Admin, separate experiences) — stubbed only
- All of MVP.md § Client Intake — sectioned intake, save-and-continue,
  intake progress, field guidance/FAQs, information reuse, conditional
  questions (no questionnaire exists in this slice)
- Document Uploading, Document Resubmission, Staff Review and
  Approval, Contextual Staff Feedback
- All of MVP.md § Application Progress — progress tracker, AI
  guidance, "whose turn" indicator
- IMPLEMENTATION_PLAN.md Phase 1: retainer-paid gating, PII access
  control, the three-role login split
- Everything in MVP.md § Later and IMPLEMENTATION_PLAN.md Phase 2 —
  correctly untouched, out of scope for this slice
