// ponytail: single visa type for the MVP; widen when more are added
export type VisaType = "student";

export type UserRole = "client" | "staff" | "admin";

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
  // Hardcoded mock AI output, pending staff review (Phase 2 demo).
  aiReport?: string;
  // Mock preview of AI-suggested form content. Real form auto-fill is
  // a stretch goal / research spike (docs/IMPLEMENTATION_PLAN.md) —
  // this is illustrative only, not a working feature.
  aiFormSuggestion?: string;
  // Admin's optional internal note when forwarding to RCIC. Visible
  // to RCIC only, never to the client (admin never contacts the
  // client directly — see docs/CURRENT_USER_FLOW_V2.md).
  adminNote?: string;
  // Set by RCIC when requesting changes.
  staffComment?: string;
}
