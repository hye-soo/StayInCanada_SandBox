# Implementation Plan: Client Portal (StayinCanada)

Standalone system for now (no Zoho integration) — see docs/DECISIONS.md
2026-09-29.

Guardrail: AI informs and verifies (flags, cross-checks, drafts) but
never gives immigration advice or submits anything unreviewed — the
RCIC has final approval on every AI-touched output.

Differentiator (per docs/COMPETITVE.md): the product isn't just a
checklist + AI checker — it's meant to explain *why* something's
needed, *whose turn it is* to act, and *what happens next*, instead of
competitors' vague statuses. Light versions of this are folded into
the checklist and status-view items below rather than a separate
subsystem.

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
      no upload yet), with a short static "why this is needed" note
      per checklist item — light version of the contextual-guidance
      differentiator (docs/COMPETITVE.md), not a full FAQ/help system

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
- [ ] Status field in-product that RCIC updates after manually
      checking IRCC's portal (per original spec — automating this
      check itself is not yet decided). Promoted from stretch per
      competitive analysis (docs/COMPETITVE.md): status tracking is
      P0/table-stakes across every competitor. Stays scoped to the
      single Student visa track — no added complexity from the
      single-visa-type decision
- [ ] Client-facing status view — simple display of the current stage
      (e.g. "Submitted to IRCC", "Awaiting IRCC Confirmation") on the
      client's checklist page from the status field above, plus who
      needs to act next (client vs. staff/RCIC) and a one-line "what
      happens next" note per stage. Promoted from stretch alongside
      the status field; kept minimal (no rich dashboard) to fit the
      timeline

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
- [ ] Automated notifications/reminders (e.g. email/in-app nudge when
      a document is missing or flagged) — marked P1/Important in
      competitive analysis (docs/COMPETITVE.md); not currently in any
      must-ship item

## Stretch goals (beyond Phase 2)

- Richer client progress dashboard (beyond the simple status view
  promoted into Phase 2 must-ship above)
- In-portal communication channel (reduce email back-and-forth)
- Support for additional visa types beyond the single MVP one
- Zoho CRM/Drive integration, if/when the standalone decision is
  revisited
