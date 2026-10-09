import { getCurrentClient } from "./current-client.ts";
import { getChecklistStore } from "./checklist-store.ts";
import type { ChecklistItem, ChecklistItemStatus, VisaType } from "./types.ts";

export function getCurrentClientChecklist(): {
  visaType: VisaType;
  items: ChecklistItem[];
} {
  const client = getCurrentClient();
  const items = getChecklistStore().getChecklist(client.id);
  return { visaType: client.visaType, items };
}

export function getCurrentClientChecklistItem(
  itemId: string
): ChecklistItem | undefined {
  const client = getCurrentClient();
  return getChecklistStore().getItem(client.id, itemId);
}

// Admin/RCIC views: items at a given stage. Single mock client for
// this demo, so this is "all items at that stage," not scoped per user.
export function getCurrentClientItemsByStatus(
  status: ChecklistItemStatus
): ChecklistItem[] {
  const client = getCurrentClient();
  return getChecklistStore()
    .getChecklist(client.id)
    .filter((item) => item.status === status);
}
