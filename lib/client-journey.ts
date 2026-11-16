import { getClientSummary } from "./client-directory.ts";
import { getJourneyStep } from "./dashboard-journey.ts";

// The client's current journey step (1-based), from the same summary
// the staff pages use — one source for the client dashboard and the
// staff profile's "Application Progress".
export function getClientJourneyStep(clientId: string): number {
  const { questionnaireComplete, questionnaireTotal, checklistCounts, submission } = getClientSummary(clientId);
  const totalItems = Object.values(checklistCounts).reduce((sum, n) => sum + n, 0);
  return getJourneyStep({
    incompleteSections: questionnaireTotal - questionnaireComplete,
    required: checklistCounts.required,
    changesRequired: checklistCounts.changes_required,
    allApproved: totalItems > 0 && checklistCounts.approved === totalItems,
    submissionState: submission.state,
  }).stepIndex;
}
