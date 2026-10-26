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

## Sandbox experiments (advisor-directed, ongoing)

Per Henry (project advisor, per docs/MEETING.md 2026-09-29): validate
these on separate git branches before committing to main. Throwaway
code is fine; log results in docs/MEETING.md's experiment table. These
feed the open questions in Phase 1/2 below.

- [x] Sandbox branch workflow set up
- [ ] DocuSign ecosystem — what it covers vs. doesn't, vs. our
      differentiator (one intake → all IRCC forms + RCIC approval)
- [x] Own login system w/ roles (Client/RCIC/Admin) vs. DocuSign —
      resolved: a sandbox prototype (branch hye-checklist-flow) built
      and validated real Firebase Auth + Firestore roles + Admin-SDK
      session verification + route protection for all 3 roles, fully
      working end to end. See docs/FIREBASE_AUTH_SANDBOX.md. DocuSign
      itself was never explored, so this isn't a head-to-head
      comparison, but "can we run our own login" is answered: yes
- [ ] File storage: cloud drive API vs. AWS S3 — upload + per-user
      access restriction, free-tier limits
- [ ] CRM research — which tables are actually needed (not adopting a
      full open-source CRM)
- [x] Headless framework choice — shadcn + Base UI, validated via the
      checklist page experiment, then further validated building the
      full hye-sandbox-v1 prototype (Badge, Card, Textarea, Button all
      used in a working Next.js 16/React 19 app)
- [ ] "Unique relationship" check (RCIC ↔ client) — meaning unclear,
      confirm with instructor

## Sandbox v2 — full user-flow demo (single branch, feature folders)

Supersedes the per-feature-branch sandbox pattern (hye-sandbox-v1 →
hye-checklist-flow, hye-dashboard-question-flow) for *this* purpose:
previously each sandboxed feature lived on its own branch, making the
overall user flow hard to see as one working thing. This builds every
phase of docs/OUR_USER_FLOW.md as one clickable product, in feature
folders under app/sandbox/, on a single branch (hye-sandbox-v2, off
main). See docs/DECISIONS.md 2026-10-26.

- [ ] Branch hye-sandbox-v2 created off main
- [ ] app/sandbox/page.tsx — flow map home page linking all 5 phases,
      plus a quick-switch panel (Client/Admin/RCIC demo accounts)
- [ ] lib/sandbox/demo-accounts.ts — reads 3 demo account credentials
      from env, reuses the existing real sign-in + createSession flow
      (no new auth mechanism)
- [ ] 3 demo accounts seeded (one per role), credentials added to
      .env.local (never committed)
- [ ] app/sandbox/onboarding/ — Phase 1 (signup/login, real Firebase Auth)
- [ ] app/sandbox/intake/ — Phase 2 (questionnaire sections)
- [ ] app/sandbox/checklist/ — Phase 3 (+ [itemId])
- [ ] app/sandbox/review/ — Phase 4 (Admin/RCIC review & validation)
- [ ] app/sandbox/preparation/ — Phase 5 (application prep / IRCC submission, mock)
- [ ] app/sandbox/dashboard/ — client landing page, entry point into the flow

## Phase 1 — Client accounts, visa-type checklist & intake questionnaire (data layer) — Must-ship

- [x] Define data model for clients, visa types, and required-document
      checklists (client ↔ visa type ↔ checklist items) — only one
      visa type needs to be seeded for the MVP, but model it so more
      can be added later without a rewrite. Built and validated in
      docs/FIREBASE_AUTH_SANDBOX.md: each real client uid gets its own
      independently-seeded checklist, not a shared mock
- [x] Client authentication (client self-sign-up / log in / session
      handling) — external, client-facing app; not staff-provisioned
      accounts. Built with Firebase Auth (email/password) + a real
      Admin-SDK-verified session cookie — see
      docs/FIREBASE_AUTH_SANDBOX.md. Backend data store for files
      (Firebase vs. AWS S3) is still undecided — checklist data itself
      is in-memory, not Firebase, behind a swappable store interface
- [x] Separate login/experience per role: Client, Admin, RCIC (per
      docs/MVP.md's 3-role Foundation scope, concretized by the
      hye-checklist-flow prototype and docs/CURRENT_USER_FLOW_V2.md —
      not generic "Staff"). Admin only triages/forwards items and
      never sets client-facing status or comments; RCIC is the sole
      gate to the client (approve or request changes) — see
      docs/DECISIONS.md 2026-10-08. Real route protection built and
      verified for all 3 roles (docs/FIREBASE_AUTH_SANDBOX.md).
      Fine-grained role-based permissions beyond this basic separation
      are Stretch (see below)
- [ ] Open question: how does a self-signed-up account get connected
      to its visa type and retainer-paid status, both of which are
      only known after a staff-run consultation happens beforehand?
      (e.g. open signup + staff links the account after, vs. an
      invite code from the welcome email) — not yet decided, needs to
      be resolved before the checklist-gating item below can be built
- [x] Seed the Student visa checklist definition (the single MVP visa
      type — see docs/DECISIONS.md 2026-09-29). Content is still
      placeholder (confirm the real required-document list with the
      client), but the seeding mechanism itself works per-client
- [ ] Gate checklist visibility on retainer-paid/onboarding status —
      checklists are only shown after the client's retainer is signed
      and paid, per the RCIC operations interview
- [ ] Access control for sensitive PII (passports, DOB, family
      details) — baseline access control is non-negotiable given real
      client data; full encryption-at-rest hardening can extend post-
      November. Partial groundwork now in place: real auth + Firestore
      rules + role-gated routes (docs/FIREBASE_AUTH_SANDBOX.md), but no
      real document storage exists yet to actually protect (uploads
      are still mocked) — leaving unchecked until that exists
- [ ] Define data model for the smart intake questionnaire (structured
      responses per client — e.g. name, DOB, family/sibling details,
      occupation) that replaces the old intake form; feeds the AI
      cross-check in Phase 2. Supports incremental/draft saves so
      client progress auto-saves and resumes exactly where they left
      off (core to the questionnaire, not deferred); sectioned into
      smaller parts with a progress indicator (per docs/MVP.md). Exact
      sections/fields now live in docs/CIF.md (filled in 2026-10-09) —
      see Phase 3 below for the concrete build steps
- [ ] Open question (per docs/MVP.md, marked "undecided" by the team):
      conditional questions — should the questionnaire change or skip
      questions based on earlier answers and visa type? Resolved for
      now: plain linear form first (per docs/CIF.md); branching can be
      layered on later per-field via docs/CIF.md's "Conditional on"
      column once there's real content to branch on
- [x] API/route to fetch a logged-in client's checklist with each
      item's status (required / submitted / under review / changes
      required / approved — per docs/MVP.md). All 5 states and their
      transitions were exercised end-to-end for real, authenticated,
      per-client accounts (docs/FIREBASE_AUTH_SANDBOX.md) — data model
      confirmed workable
- [x] Minimal client-facing page listing their checklist (now with
      working upload too, exceeding "read-only"), with a short static
      "why this is needed" note per checklist item — light version of
      the contextual-guidance differentiator (docs/COMPETITVE.md), not
      a full FAQ/help system

## Phase 2 — Document upload, AI verification & IRCC pipeline

Cost preference: prefer free-tier AI/OCR services or open-source
models over paid APIs where feasible (per docs/DISCOVERY.md); not a
hard block — revisit if free-tier limits can't support the AI checks
below.

### Must-ship

- [x] Document upload endpoint/UI tied to checklist items (4 MB max
      per file, per IRCC requirement) — built and tested as a *mock*
      upload (records name/size, enforces the limit, no real file is
      stored). Real storage (Firebase Storage vs. AWS S3, per the
      sandbox-experiments section above) is still undecided
- [ ] AI check of uploaded documents against the single visa type's
      checklist, flagging missing/incomplete items and documents in an
      unapproved language without an English/French translation
      (current-state rejection reason, per CURRENT_USER_FLOW.md) —
      still a hardcoded mock AI report (docs/FIREBASE_AUTH_SANDBOX.md),
      not a real check; leaving unchecked
- [ ] AI cross-check of intake questionnaire answers against uploaded
      document contents (e.g. name/DOB spelling matches passport) —
      per Omar, this is the highest-value feature of the proposal.
      Scoped narrow for the demo: 1–2 document types (e.g. passport),
      not full coverage of every document in the checklist. Not
      started — no questionnaire exists and there is no real AI
- [x] Admin review screen — view the AI's flagged report (plus a mock
      AI-suggested form-entry preview, see docs/DECISIONS.md
      2026-10-08) and forward to RCIC, with an optional internal note
      (visible to RCIC only, never to the client). Admin has no
      approve/request-changes power of its own — validated structure,
      see docs/DECISIONS.md 2026-10-08. Now built with real per-client
      data and real auth-gated access (docs/FIREBASE_AUTH_SANDBOX.md)
- [x] RCIC review/approval screen — the sole gate to the client: view
      items Admin forwarded (AI report, form-entry preview, Admin's
      note) and either approve or request changes with a comment.
      Demonstrates the human-in-the-loop guardrail central to the
      pitch; polish is stretch. Built with real auth + cross-client
      queries (docs/FIREBASE_AUTH_SANDBOX.md)
- [x] Document resubmission flow: client can replace a document after
      RCIC marks it "changes required" (per docs/MVP.md)
- [x] Contextual client-facing feedback: RCIC can leave a comment
      visible to the client when requesting changes (per docs/MVP.md)
      — a light per-item comment tied to the resubmission flow above,
      not a general two-way messaging system (that stays out of
      scope, see Stretch goals). Admin's internal note to RCIC above
      is separate and never reaches the client.
- [ ] Status field in-product that RCIC updates after manually
      checking IRCC's portal (per original spec — automating this
      check itself is not yet decided). Promoted from stretch per
      competitive analysis (docs/COMPETITVE.md): status tracking is
      P0/table-stakes across every competitor. Stays scoped to the
      single Student visa track — no added complexity from the
      single-visa-type decision. Note: this is specifically
      post-submission IRCC status tracking, which is a further stage
      than the internal approve/request-changes flow already built —
      still not started
- [x] Client-facing status view — simple display of the current stage
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
      research spike above. The sandbox's mock AI-suggested
      form-entry preview (docs/DECISIONS.md 2026-10-08) is a static
      demo/pitch aid only — it does not resolve this spike's
      feasibility question
- [ ] Full AI cross-check coverage across every document type in the
      checklist, not just the 1–2 scoped for the must-ship demo
- [ ] Automated notifications/reminders (e.g. email/in-app nudge when
      a document is missing or flagged) — marked P1/Important in
      competitive analysis (docs/COMPETITVE.md) and listed as "Later"
      in docs/MVP.md; not currently in any must-ship item. Two
      concrete triggers requested by Jean, to implement here if time
      allows:
      - Inactivity reminder: no documents uploaded within 7–10 (or 15)
        days of the onboarding email → follow-up email to the client
      - Upload receipt confirmation: instant email listing files
        received, noting an RCIC will review them

## Phase 3 — Client dashboard & smart intake questionnaire — Must-ship

Client dashboard first, before any Admin/RCIC dashboard (see
docs/DECISIONS.md). Ordered build steps:

- [x] Fill in docs/CIF.md with the real CIF sections/fields — the real
      form is bigger than a flat field list: Sections A-D and the
      Declaration are fixed fields/yes-no questions, but Employment
      (E), Education (F), Addresses (G), Children (I), Siblings (J),
      and Travel History (K) are repeatable groups/tables (variable
      count, not fixed slots). The Photograph Specifications at the
      end are instructional content, not a data-collection section —
      they belong as guidance on a document-checklist item, not in
      the questionnaire itself — confirmed: add a new "Photo" item to
      the Student visa checklist (lib/checklist-store.ts doesn't have
      one yet), using the Photograph Specifications text from
      docs/CIF.md as its "why this is needed" guidance content
- [x] Questionnaire data model (lib/types.ts): per-client response
      record matching docs/CIF.md's actual structure — fixed fields
      for sections A-D, an array of answers for each repeatable group
      (employers, institutions, addresses, children, siblings, travel
      history entries), and a fixed yes/no map for the Declaration.
      Status per section (not started / in progress / complete) for
      the progress indicator
- [x] Questionnaire store: same pattern as lib/checklist-store.ts —
      lazily seed an empty draft per client uid, auto-save on each
      field change, behind a swappable interface
- [x] Questionnaire UI (/questionnaire): all 11 CIF sections built,
      save-and-continue, per-section progress indicator — applicant
      info paginated into 3 steps (per docs/MEETING.md's language-
      barrier guidance), the rest plain linear single-page sections
- [x] Client dashboard page (/dashboard): combines questionnaire
      progress summary + link to continue, document checklist summary,
      and derived application stage into one landing page, per the
      provided wireframe
- [x] Make /dashboard the client role's post-login landing page
      (lib/role-landing.ts ROLE_LANDING); /checklist and /questionnaire
      stay reachable from it, not replaced by it
- [ ] Admin dashboard and RCIC dashboard — promoted from Stretch for
      the full-flow demo; see the new Phase 4 section below instead of
      Stretch goals
- [ ] Add the "Photo" item to the Student visa checklist seed
      (lib/checklist-store.ts), using the Photograph Specifications
      text from docs/CIF.md as its guidance content — deprioritized to
      last; the questionnaire matters more right now

## Phase 4 — Shared Admin/RCIC per-client dashboard, questionnaire visibility & application preparation — Must-ship (for full-flow demo)

Per docs/OUR_USER_FLOW.md, promoted from Stretch (supersedes the
2026-10-09 deferral — see docs/DECISIONS.md). One shared dashboard
shell for Admin and RCIC (same layout, role-specific actions), not two
separate dashboards. Questionnaire visibility is read-only for both
roles — the client's own progress indicator already surfaces missing
sections, so no separate admin "flag" action is needed; corrections
still go through the existing per-document checklist correction loop.

- [ ] lib/checklist-store.ts: add `getAllClientIds()` (every client
      ever seeded) — the only current way to enumerate "all clients"
- [ ] lib/client-directory.ts: `getAllClientSummaries()` — per client:
      visa type, questionnaire progress, checklist status counts,
      derived application stage. Pure aggregation over existing
      checklist/questionnaire/application-stage modules, no new data
- [ ] Shared client-list UI, rendered at both /admin and /rcic index
      pages — replaces today's flat cross-client item list with a real
      "All Clients" view (per docs/OUR_USER_FLOW.md's screen list)
- [ ] /admin/[clientId]: per-client detail — read-only questionnaire
      section-status summary (closes the Phase 2 visibility gap) +
      existing checklist items and forward-to-RCIC action, now scoped
      to one client instead of a flat cross-client list
- [ ] /rcic/[clientId]: same read-only questionnaire summary +
      existing checklist items and approve/request-changes actions,
      scoped to one client
- [ ] Questionnaire CIF summary/print view: a clean, print-styled page
      showing the client's completed CIF, with a "Download PDF" button
      using the browser's native print-to-PDF (no new PDF-generation
      dependency). Reused by the client's own /questionnaire (download
      their own CIF) and by Admin/RCIC's per-client page (read-only
      review of the same content)
- [ ] Phase 5 (Application Preparation): lib/application-submission-
      store.ts — per-client state `ready -> packaged ->
      submitted_to_ircc`. "ready" once every checklist item is
      approved (derived, not stored). Admin gets a "Mark package ready
      for RCIC" action; RCIC gets "Send to IRCC" (the flow's FINISH)
- [ ] Client dashboard's application-stage card reflects "packaged" /
      "submitted to IRCC" states too, so the client sees Phase 5
      progress, matching docs/OUR_USER_FLOW.md Phase 5's client row

## Stretch goals (beyond Phase 2)

- Fine-grained role-based permissions (beyond the basic separate
  Client/Admin/RCIC logins already in Phase 1 must-ship — per
  docs/MVP.md)
- Admin dashboard and RCIC dashboard — promoted to Phase 4 above for
  the full-flow demo (see docs/DECISIONS.md); further polish beyond
  Phase 4's version stays here (e.g. search/filtering the client list)
- Search and filtering (per docs/MVP.md)
- Richer client dashboard polish (beyond Phase 3's basic version —
  e.g. richer visualizations, not just a progress summary)
- General two-way in-portal communication channel (beyond the
  per-item RCIC feedback already in Phase 2 must-ship)
- Support for additional visa types beyond the single MVP one
- Zoho CRM/Drive integration, if/when the standalone decision is
  revisited
