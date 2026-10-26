import { getApplicationSubmissionStore } from "./application-submission-store.ts";
import { getActivityLogStore } from "./activity-log-store.ts";
import {
  transitionSubmission,
  type ApplicationSubmission,
  type SubmissionAction,
  type SubmissionTransitionResult,
} from "./application-submission-transitions.ts";
import { getClientChecklist } from "./client-checklist.ts";

function describeAction(
  action: SubmissionAction,
  actorName: string,
  submission: ApplicationSubmission
): string {
  switch (action.type) {
    case "validate":
      return `Requirements validated by ${actorName}`;
    case "return_with_changes":
      return `${actorName} returned requirements with changes`;
    case "prepare_package":
      return `${actorName} prepared package v${submission.package?.version}`;
    case "approve_package":
      return `${actorName} approved package v${submission.package?.version}`;
    case "return_package_for_correction":
      return `${actorName} returned package v${submission.package?.version} for correction`;
    case "record_submission":
      return "Submission and receipt recorded";
  }
}

// clientId must come from a server-verified source (requireRole()),
// same rule as lib/apply-checklist-action.ts. actorName is the
// signed-in user's own display name/email, for the activity log —
// never trusted from client input beyond that.
export function applySubmissionAction(
  clientId: string,
  action: SubmissionAction,
  actorName: string
): SubmissionTransitionResult {
  if (action.type === "validate") {
    const { items } = getClientChecklist(clientId);
    const allApproved = items.length > 0 && items.every((item) => item.status === "approved");
    if (!allApproved) {
      return { error: "Not every checklist item is approved yet." };
    }
  }

  const store = getApplicationSubmissionStore();
  const result = transitionSubmission(store.get(clientId), action);
  if (!result.submission) return result;

  store.set(clientId, result.submission);
  getActivityLogStore().append(clientId, describeAction(action, actorName, result.submission));
  return result;
}
