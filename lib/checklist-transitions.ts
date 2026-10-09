import type { ChecklistItem } from "./types.ts";

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

// Hardcoded mock AI output for the demo — same text for every item.
// Always labeled "pending staff review" in the UI; never auto-approves.
export const MOCK_AI_REPORT = "Name on passport does not match the intake form.";

// Mock preview of AI-suggested form content — illustrative only, not
// a working auto-fill (see docs/IMPLEMENTATION_PLAN.md stretch goal).
export const MOCK_AI_FORM_SUGGESTION =
  "Suggested CIF entry: Full Name - JORDAN LEE, Date of Birth - 2000-01-15";

export type ChecklistAction =
  | { type: "upload"; file: { name: string; size: number } }
  | { type: "mark_reviewed"; note?: string }
  | { type: "approve" }
  | { type: "request_changes"; comment: string };

export type TransitionResult =
  | { item: ChecklistItem; error?: undefined }
  | { item?: undefined; error: string };

// The one function status transitions go through — upload, approve,
// and request-changes are the only three actions this demo supports.
export function transitionChecklistItem(
  item: ChecklistItem,
  action: ChecklistAction
): TransitionResult {
  switch (action.type) {
    case "upload": {
      if (action.file.size > MAX_UPLOAD_BYTES) {
        return {
          error: `"${action.file.name}" is larger than 4 MB. Choose a smaller file.`,
        };
      }
      return {
        item: {
          ...item,
          status: "submitted",
          fileName: action.file.name,
          fileSize: action.file.size,
          aiReport: MOCK_AI_REPORT,
          aiFormSuggestion: MOCK_AI_FORM_SUGGESTION,
          rcicComment: undefined,
        },
      };
    }
    // Admin's only action: forward a submitted item to RCIC, with an
    // optional internal note (visible to RCIC only). Admin never sets
    // client-facing status/comments directly (per
    // docs/CURRENT_USER_FLOW_V2.md — RCIC is the sole client interface).
    case "mark_reviewed":
      return { item: { ...item, status: "under_review", adminNote: action.note } };
    case "approve":
      return { item: { ...item, status: "approved" } };
    case "request_changes":
      return {
        item: { ...item, status: "changes_required", rcicComment: action.comment },
      };
  }
}
