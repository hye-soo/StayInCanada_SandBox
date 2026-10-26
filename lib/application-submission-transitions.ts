export type SubmissionState = "ready" | "packaged" | "submitted_to_ircc";

export type SubmissionAction = { type: "mark_packaged" } | { type: "mark_submitted" };

export interface SubmissionTransitionResult {
  state?: SubmissionState;
  error?: string;
}

// Phase 5 (docs/OUR_USER_FLOW.md): Admin packages a client's completed,
// fully-approved file for RCIC; RCIC sends it to IRCC (the flow's
// FINISH). Whether checklist items are actually all approved is
// checked by the caller (lib/apply-submission-action.ts), not here —
// this only enforces the state machine's own ordering.
export function transitionSubmissionState(
  current: SubmissionState,
  action: SubmissionAction
): SubmissionTransitionResult {
  switch (action.type) {
    case "mark_packaged":
      if (current !== "ready") {
        return { error: `Cannot mark packaged from state "${current}".` };
      }
      return { state: "packaged" };
    case "mark_submitted":
      if (current !== "packaged") {
        return { error: `Cannot submit to IRCC from state "${current}".` };
      }
      return { state: "submitted_to_ircc" };
  }
}
