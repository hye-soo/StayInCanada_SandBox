import { getApplicationSubmissionStore } from "./application-submission-store.ts";
import {
  transitionSubmissionState,
  type SubmissionAction,
  type SubmissionTransitionResult,
} from "./application-submission-transitions.ts";
import { getClientChecklist } from "./client-checklist.ts";

// clientId must come from a server-verified source (requireRole()),
// same rule as lib/apply-checklist-action.ts.
export function applySubmissionAction(
  clientId: string,
  action: SubmissionAction
): SubmissionTransitionResult {
  if (action.type === "mark_packaged") {
    const { items } = getClientChecklist(clientId);
    const allApproved = items.length > 0 && items.every((item) => item.status === "approved");
    if (!allApproved) {
      return { error: "Not every checklist item is approved yet." };
    }
  }

  const store = getApplicationSubmissionStore();
  const result = transitionSubmissionState(store.getState(clientId), action);
  if (result.state) store.setState(clientId, result.state);
  return result;
}
