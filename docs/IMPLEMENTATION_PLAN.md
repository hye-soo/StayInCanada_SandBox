# Implementation Plan: Client Portal (StayinCanada)

Standalone system for now (no Zoho integration) — see docs/DECISIONS.md
2026-09-29.

Guardrail: AI informs and verifies (flags, cross-checks, drafts) but
never gives immigration advice or submits anything unreviewed — the
RCIC has final approval on every AI-touched output.

Scope for the November deadline: **one visa type only — Student visa**
(see docs/DECISIONS.md 2026-09-29). Items below are split into **Must-ship**
(the demo that proves the core idea works end-to-end) and **Stretch
goals** (built only if time allows; otherwise presented as future
work, not left as unfinished code).

## Phase 1 — Client accounts, visa-type checklist & intake questionnaire (data layer) — Must-ship

- [ ] Define data model for clients, visa types, and required-document
      checklists (client ↔ visa type ↔ checklist items) — only one
      visa type needs to be seeded for the MVP, but model it so more
      can be added later without a rewrite
- [ ] Client authentication (client self-sign-up / log in / session
      handling) — external, client-facing app; not staff-provisioned
      accounts. Planned to use Firebase Auth (per docs/DISCOVERY.md).
      Open question: whether the rest of the data store (client
      records, checklists, questionnaire responses, documents) also
      lives in Firebase (Firestore/Storage) or elsewhere — not yet
      decided
- [ ] Open question: how does a self-signed-up account get connected
      to its visa type and retainer-paid status, both of which are
      only known after a staff-run consultation happens beforehand?
      (e.g. open signup + staff links the account after, vs. an
      invite code from the welcome email) — not yet decided, needs to
      be resolved before the checklist-gating item below can be built
- [ ] Seed the Student visa checklist definition (the single MVP visa
      type — see docs/DECISIONS.md 2026-09-29)
- [ ] Gate checklist visibility on retainer-paid/onboarding status —
      checklists are only shown after the client's retainer is signed
      and paid, per the RCIC operations interview
- [ ] Access control for sensitive PII (passports, DOB, family
      details) — baseline access control is non-negotiable given real
      client data; full encryption-at-rest hardening can extend post-
      November
- [ ] Define data model for the smart intake questionnaire (structured
      responses per client — e.g. name, DOB, family/sibling details,
      occupation) that replaces the old intake form; feeds the AI
      cross-check in Phase 2. Supports incremental/draft saves so
      client progress auto-saves and resumes exactly where they left
      off (core to the questionnaire, not deferred)
- [ ] API/route to fetch a logged-in client's checklist with each
      item's status (not yet uploaded / uploaded / missing)
- [ ] Minimal client-facing page listing their checklist (read-only,
      no upload yet)

## Phase 2 — Document upload, AI verification & IRCC pipeline

Cost preference: prefer free-tier AI/OCR services or open-source
models over paid APIs where feasible (per docs/DISCOVERY.md); not a
hard block — revisit if free-tier limits can't support the AI checks
below.

### Must-ship

- [ ] Document upload endpoint/UI tied to checklist items (4 MB max
      per file, per IRCC requirement)
- [ ] AI check of uploaded documents against the single visa type's
      checklist, flagging missing/incomplete items and documents in an
      unapproved language without an English/French translation
      (current-state rejection reason, per CURRENT_USER_FLOW.md)
- [ ] AI cross-check of intake questionnaire answers against uploaded
      document contents (e.g. name/DOB spelling matches passport) —
      per Omar, this is the highest-value feature of the proposal.
      Scoped narrow for the demo: 1–2 document types (e.g. passport),
      not full coverage of every document in the checklist
- [ ] RCIC review/approval UI — basic version: view the AI's flagged
      report and approve/reject. Demonstrates the human-in-the-loop
      guardrail that's central to the whole pitch; polish is stretch

### Stretch goals

- [ ] Research spike: feasibility of auto-populating official IRCC PDF
      forms directly (technical, legal, and scope constraints flagged
      by the dev team — not yet a committed feature; see
      docs/DECISIONS.md 2026-09-29)
- [ ] AI auto-fill of the relevant government form (e.g. Client
      Information Form) from submitted documents — contingent on the
      research spike above
- [ ] Full AI cross-check coverage across every document type in the
      checklist, not just the 1–2 scoped for the must-ship demo
- [ ] Status field in-product that RCIC updates after manually
      checking IRCC's portal (per original spec — automating this
      check itself is not yet decided)

## Stretch goals (beyond Phase 2)

- Application status tracker for clients
- In-portal communication channel (reduce email back-and-forth)
- Support for additional visa types beyond the single MVP one
- Zoho CRM/Drive integration, if/when the standalone decision is
  revisited
