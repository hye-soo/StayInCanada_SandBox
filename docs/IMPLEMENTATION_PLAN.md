# Implementation Plan: Client Portal (StayinCanada)

Standalone system for now (no Zoho integration) — see docs/DECISIONS.md
2026-09-29.

## Phase 1 — Client accounts, visa-type checklist & intake questionnaire (data layer)

- [ ] Define data model for clients, visa types, and required-document
      checklists (client ↔ visa type ↔ checklist items)
- [ ] Client authentication (sign up / log in / session handling)
- [ ] Seed/admin-manageable checklist definitions per visa type
- [ ] Gate checklist visibility on retainer-paid/onboarding status —
      checklists are only shown after the client's retainer is signed
      and paid, per the RCIC operations interview
- [ ] Define data model for the smart intake questionnaire (structured
      responses per client — e.g. name, DOB, family/sibling details,
      occupation) that replaces the old intake form; feeds the AI
      cross-check in Phase 2
- [ ] API/route to fetch a logged-in client's checklist with each
      item's status (not yet uploaded / uploaded / missing)
- [ ] Minimal client-facing page listing their checklist (read-only,
      no upload yet)

## Phase 2 — Document upload, AI verification & IRCC pipeline

- [ ] Document upload endpoint/UI tied to checklist items (4 MB max
      per file, per IRCC requirement)
- [ ] AI check of uploaded documents against the checklist, flagging
      missing/incomplete items and documents in an unapproved language
      without an English/French translation (current-state rejection
      reason, per CURRENT_USER_FLOW.md)
- [ ] AI cross-check of intake questionnaire answers against uploaded
      document contents (e.g. name/DOB spelling matches passport) —
      per Omar, this is the highest-value feature of the proposal
- [ ] Research spike: feasibility of auto-populating official IRCC PDF
      forms directly (technical, legal, and scope constraints flagged
      by the dev team — not yet a committed feature; see
      docs/DECISIONS.md 2026-09-29)
- [ ] AI auto-fill of the relevant government form (e.g. Client
      Information Form) from submitted documents — contingent on the
      research spike above
- [ ] RCIC review/approval UI for the auto-filled form before
      submission to IRCC
- [ ] Status field in-product that RCIC updates after manually
      checking IRCC's portal (per original spec — automating this
      check itself is not yet decided)

## Later phases (not yet detailed)

- Application status tracker for clients + auto-saving form entries
- In-portal communication channel (reduce email back-and-forth)
- Zoho CRM/Drive integration, if/when the standalone decision is
  revisited
