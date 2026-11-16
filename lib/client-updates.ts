import type { ChecklistItem } from "./types.ts";

export interface UpdateRow {
  itemId: string;
  title: string;
  description: string;
  needsAction: boolean;
  actionLabel: string;
}

// A lightweight "updates" feed built entirely from existing checklist
// data — no separate notification/read-state store exists yet (see
// docs/DECISIONS.md). Every non-baseline item becomes one row,
// ordered so what needs the client's attention comes first.
export function getClientUpdateRows(items: ChecklistItem[]): UpdateRow[] {
  const rows: UpdateRow[] = items.map((item) => {
    switch (item.status) {
      case "changes_required":
        return {
          itemId: item.id,
          title: `${item.label} needs replacing`,
          description: item.staffComment ?? "Your case team flagged this document.",
          needsAction: true,
          actionLabel: "Open feedback",
        };
      case "required":
        return {
          itemId: item.id,
          title: `${item.label} is required`,
          description: "Upload this document so your case team can review it.",
          needsAction: true,
          actionLabel: "Upload file",
        };
      case "submitted":
      case "under_review":
        return {
          itemId: item.id,
          title: `${item.label} is being reviewed`,
          description: "Your case team is checking this document. No action needed from you.",
          needsAction: false,
          actionLabel: "View status",
        };
      case "approved":
        return {
          itemId: item.id,
          title: `${item.label} completed`,
          description: "Approved — no action needed.",
          needsAction: false,
          actionLabel: "View",
        };
    }
  });

  return rows.sort((a, b) => Number(b.needsAction) - Number(a.needsAction));
}
