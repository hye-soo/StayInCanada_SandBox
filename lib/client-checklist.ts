import { getChecklistStore } from "./checklist-store.ts";
import type { ChecklistItem, VisaType } from "./types.ts";

// Single visa type for the whole MVP (see docs/DECISIONS.md,
// 2026-09-29) — not stored per-client, since there's only ever one.
const MVP_VISA_TYPE: VisaType = "student";

export function getClientChecklist(clientId: string): {
  visaType: VisaType;
  items: ChecklistItem[];
} {
  return { visaType: MVP_VISA_TYPE, items: getChecklistStore().getChecklist(clientId) };
}

export function getClientChecklistItem(
  clientId: string,
  itemId: string
): ChecklistItem | undefined {
  return getChecklistStore().getItem(clientId, itemId);
}
