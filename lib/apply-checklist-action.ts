import { getCurrentClient } from "./current-client.ts";
import { getChecklistStore } from "./checklist-store.ts";
import { transitionChecklistItem, type ChecklistAction, type TransitionResult } from "./checklist-transitions.ts";

// Thin orchestration for the current (mock) client: looks up the item,
// runs it through the one transition function, and persists the
// result via the store interface if the action was accepted.
export function applyChecklistAction(
  itemId: string,
  action: ChecklistAction
): TransitionResult {
  const client = getCurrentClient();
  const store = getChecklistStore();
  const item = store.getItem(client.id, itemId);
  if (!item) return { error: "Checklist item not found." };

  const result = transitionChecklistItem(item, action);
  if (result.item) store.updateItem(client.id, result.item);
  return result;
}
