import { getChecklistStore } from "./checklist-store.ts";
import { transitionChecklistItem, type ChecklistAction, type TransitionResult } from "./checklist-transitions.ts";

// Thin orchestration: looks up the given client's item, runs it
// through the one transition function, and persists the result via
// the store interface if the action was accepted. clientId must come
// from a server-verified source (lib/firebase/session.ts's
// requireRole()), never trusted from client input.
export function applyChecklistAction(
  clientId: string,
  itemId: string,
  action: ChecklistAction
): TransitionResult {
  const store = getChecklistStore();
  const item = store.getItem(clientId, itemId);
  if (!item) return { error: "Checklist item not found." };

  const result = transitionChecklistItem(item, action);
  if (result.item) store.updateItem(clientId, result.item);
  return result;
}
