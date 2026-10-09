# Decisions Log

<!--
Entries get appended here over time, one per real architectural choice.
Never rewrite or delete past entries — append only.

## YYYY-MM-DD — Short decision title
Context: why this decision needed to be made
Decision: what was decided
Alternatives considered: what else was considered and why it was rejected
-->

## 2026-09-29 — Build standalone; no Zoho integration for MVP
**Context:** The business currently runs retainer/invoicing through
Zoho CRM and hands off documents via a Zoho Drive folder link, and is
consolidating its internal tools into the Zoho ecosystem. This raised
the question of whether the client portal should integrate with Zoho
from the start (pulling retainer-paid status, syncing documents) or
be built independently.
**Decision:** Build the portal's data model and auth standalone, with
no Zoho integration for now. Integration can be revisited as a later
phase once the core product (Phases 1–2) is proven.
**Alternatives considered:** Integrating with Zoho CRM/Drive from
Phase 1 — rejected for now to avoid coupling the MVP's data model and
auth to an external system's availability and schema before the core
product itself is validated.

## 2026-09-29 — IRCC PDF auto-fill treated as a research spike, not a committed feature
**Context:** Omar (Business/Marketing/Financial Partner) asked whether
the system could auto-populate official IRCC PDF forms directly,
citing a demo tool (Visa.ca) as a reference point. The dev team agreed
to research backend feasibility but flagged technical, legal, and
scope limitations that are not yet resolved.
**Decision:** Scope IRCC PDF auto-fill in the implementation plan as a
research spike (feasibility investigation) that precedes and gates the
actual auto-fill build item, rather than treating it as an already
committed feature.
**Alternatives considered:** Committing to build IRCC PDF auto-fill
outright in Phase 2 — rejected because the legal and technical
feasibility (e.g. whether directly populating a government PDF form is
permitted/reliable) has not been established.

## 2026-09-29 — Project scope: forms-filling/client-workflow automation, not a lead-gen chatbot
**Context:** The client (StayinCanada) had two candidate project ideas
for the student team engagement: an internal forms-filling and client
workflow automation tool, and a lead-generation chatbot for prospective
clients.
**Decision:** Scope the project entirely around forms-filling and
client workflow automation (client portal, smart intake, AI
cross-check, RCIC-reviewed auto-fill) as captured in this plan.
**Alternatives considered:** A lead-generation chatbot (the client's
"Idea 1") — not pursued for this engagement; it addresses the
top-of-funnel inquiry stage rather than the post-retainer operational
bottlenecks (incomplete CIFs, manual verification, no status
visibility) that were the primary pain points surfaced in discovery.

## 2026-09-29 — Scope to a single visa type for the November deadline
**Context:** The project has a hard end date (end of November 2026,
student team, ~8–9 weeks left as of this decision). The full proposed
solution — multi-visa-type checklists, broad AI document
cross-verification, and IRCC PDF auto-fill — is too large to build to
a reliable standard in that time, especially on free-tier AI/OCR
services. The highest-risk, highest-value part of the project is the
AI verification pipeline itself, not the number of visa types
supported.
**Decision:** Scope the MVP to exactly one visa type end-to-end
(account → checklist → questionnaire → upload → AI verification →
RCIC review), and split the plan into "must-ship by November" vs.
"stretch goal" items. Data models are still built to allow more visa
types later, but only one is seeded and demoed.
**Alternatives considered:** Supporting multiple visa types from the
start — rejected because it multiplies checklist/questionnaire
content work without adding technical depth, spending time that's
better spent making the AI verification pipeline actually reliable for
one case first.

## 2026-09-29 — MVP visa type: Student visa
**Context:** The single-visa-type MVP decision above left open which
visa type to build for. Discovery notes mention Spousal Sponsorship,
TRV, and Study Permit as example pathways handled by the client.
**Decision:** Build the MVP around the Student visa pathway.
**Alternatives considered:** Spousal Sponsorship and TRV (Temporary
Resident Visa) — not chosen for the MVP; can be added later using the
same data model once Student visa proves the pipeline works.

## 2026-09-29 — Promote status tracking from stretch to must-ship
**Context:** The 2026-09-29 "single visa type" decision split the plan
into must-ship vs. stretch, and put status tracking (the RCIC-updated
status field and a client-facing status view) in stretch. A
competitive analysis (docs/COMPETITVE.md) done afterward scored status
tracking / progress dashboard as P0-Essential — every direct
competitor and even manual substitutes (spreadsheets) provide it.
**Decision:** Promote the status field and a simple client-facing
status view into Phase 2 must-ship. This doesn't add real scope risk
because the single-visa-type decision already keeps it to one track;
it's a status field plus a read-only display, not a new subsystem.
**Alternatives considered:** Keeping it as stretch — rejected because
skipping something every competitor (including manual spreadsheet
workflows) already provides would make the MVP look incomplete by
comparison, for comparatively low implementation cost.

## 2026-09-29 — Fold contextual guidance into must-ship as a light version
**Context:** An expanded docs/COMPETITVE.md reframed the product's core
differentiator as contextual guidance — explaining why a document is
needed, whose turn it is to act, and what happens next — versus
competitors' vague statuses. This wasn't in the plan at all.
**Decision:** Add a light version to already-must-ship items rather
than a new subsystem: a short static "why this is needed" note per
checklist item (Phase 1), and a "who acts next" + one-line "what
happens next" note on the client-facing status view (Phase 2). A full
FAQ/help system or staff-notes/messaging feature stays out of scope
for November.
**Alternatives considered:** Keeping it as a later enhancement —
rejected because the competitive analysis frames it as the actual
differentiator, not a nice-to-have, and the light version is cheap
(static copy, not a new feature) so it fits the timeline; building the
full version (FAQs, staff messaging) was rejected for November as too
costly given everything else already committed.

## 2026-10-08 — Three separate logins (Client/Staff/Admin), fine-grained permissions deferred
**Context:** Two earlier sessions (docs/CURRENT_USER_FLOW_V2.md and the
sandbox-experiment permission matrix in docs/MEETING.md) raised whether
the MVP should merge Admin and Consultant/RCIC into one "staff" login
or build the real 3-role split, and left it open pending a sandbox
experiment. docs/MVP.md, the team's own MVP scoping doc, settles this
directly: "Client, Staff and Admin Login: separate experiences and
access by user role" is listed under Foundation/Core MVP, while "Role
Based Permissions" (fine-grained access control) is explicitly listed
under "Later (If Time Allows)."
**Decision:** Build three separate login experiences (Client, Staff,
Admin) as part of Phase 1 must-ship. Fine-grained, per-action
permission rules beyond that basic separation are deferred to Stretch.
Which technology implements the login (Firebase Auth, DocuSign, or
custom) remains a separate, still-open sandbox experiment.
**Alternatives considered:** Merging Admin and Staff into one login
for the MVP to save time — superseded by the team's own MVP.md, which
treats the 3-way split as foundational rather than optional.

## 2026-10-08 — Concrete Admin/RCIC split, validated via sandbox prototype
**Context:** The 2026-10-08 "three separate logins" decision above
settled on Client/Staff/Admin generically, without pinning down what
"Staff" actually does or how it divides from Admin. docs/CURRENT_USER_FLOW_V2.md
documents Admin (checks documents, flags issues, fills forms, submits)
and Consultant/RCIC (sole contact with the client, final approval) as
distinct roles that never overlap — Admin never talks to the client in
either branch of the real flow. A clickable sandbox prototype (branch
hye-sandbox-v1, mock data only) built and exercised this exact split
end to end.
**Decision:** Replace generic "Staff" with two concrete roles, Admin
and RCIC. Admin's only action is forwarding a reviewed item to RCIC,
with an optional internal note (visible to RCIC only); Admin never
sets client-facing status or comments. RCIC is the sole gate to the
client, with both approve and request-changes actions. This structure
is now validated by a working (mock) implementation, not just a
flowchart reading.
**Alternatives considered:** Giving Admin its own explicit "flag as
incomplete" vs. "forward as clean" decision, literally mirroring the
real-world process's two branches — simplified instead to Admin always
forwarding (with optional context via the note) and letting RCIC make
the single final call either way, since the product's stated goal is
collapsing scattered back-and-forth communication into one workspace,
not replicating every manual hop of the current process.

## 2026-10-08 — Mock AI form-suggestion preview is a demo aid, not a resolved feature
**Context:** docs/CURRENT_USER_FLOW_V2.md's "Admin fills the IRCC
application forms with verified information" step maps to the
already-flagged IRCC PDF auto-fill stretch goal (2026-09-29 decision),
whose feasibility is still unresolved. To make this step visible in
the sandbox demo, a static mock "AI-suggested form entry" preview
(hardcoded text, no real parsing) was added to the Admin and RCIC
screens, clearly labeled "preview only, not a working auto-fill."
**Decision:** Keep IRCC PDF auto-fill scoped as a stretch goal/research
spike, unchanged. The sandbox's mock preview is a demo/pitch aid for
visualizing the concept to stakeholders, not evidence toward resolving
the feasibility question, and should not be read as "this stretch goal
is now built."
**Alternatives considered:** Treating the mock preview as validating
the auto-fill feature — rejected; it is static hardcoded text with no
real document parsing or form-field logic behind it.
