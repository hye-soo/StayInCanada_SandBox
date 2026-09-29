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
