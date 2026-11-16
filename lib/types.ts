// ponytail: single visa type for the MVP; widen when more are added
export type VisaType = "student";

export type UserRole = "client" | "rcic" | "admin";

export interface AppUser {
  id: string;
  role: UserRole;
}

export interface Client extends AppUser {
  role: "client";
  name: string;
  visaType: VisaType;
}

export type ChecklistItemStatus =
  | "required"
  | "submitted"
  | "under_review"
  | "changes_required"
  | "approved";

export interface ChecklistItem {
  id: string;
  label: string;
  whyNeeded: string;
  status: ChecklistItemStatus;
  // Set by the mock upload flow — no real file is ever stored.
  fileName?: string;
  fileSize?: number;
  // When the client last uploaded this item (staff "Received" column).
  submittedAt?: number;
  // Hardcoded mock AI output, pending staff review (Phase 2 demo).
  aiReport?: string;
  // Mock preview of AI-suggested form content. Real form auto-fill is
  // a stretch goal / research spike (docs/IMPLEMENTATION_PLAN.md) —
  // this is illustrative only, not a working feature.
  aiFormSuggestion?: string;
  // Admin's optional internal note when forwarding to RCIC. Visible
  // to RCIC only, never to the client.
  adminNote?: string;
  // RCIC's internal note back to Admin when something's wrong — RCIC
  // never contacts the client directly (docs/DECISIONS.md 2026-10-26,
  // superseding the earlier "RCIC is sole client gate" decision: Admin
  // now does all client-facing operational work; RCIC routes issues
  // through Admin instead).
  rcicFlagNote?: string;
  // Client-visible comment, set by Admin's request_changes action.
  staffComment?: string;
  // ponytail: single prior attempt, not a real history list — upgrade
  // to a real history list if more than "what did I replace" is ever
  // needed. Set when a resubmission overwrites a flagged upload.
  previousUpload?: { fileName: string; fileSize: number; comment?: string };
}

