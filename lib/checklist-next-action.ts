import type { ChecklistItem } from "./types.ts";

// The single most urgent item for the client to act on right now —
// a flagged resubmission before a fresh upload, since that's the one
// blocking review. Shared by the dashboard's "next action" callout
// and the checklist list's own callout (docs/OUR_USER_FLOW.md Phase 3).
export function getNextChecklistItem(items: ChecklistItem[]): ChecklistItem | undefined {
  return (
    items.find((item) => item.status === "changes_required") ??
    items.find((item) => item.status === "required")
  );
}
