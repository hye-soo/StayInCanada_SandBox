import type { SubmissionState } from "./application-submission-transitions.ts";

export const JOURNEY_STEPS = ["Onboarding", "Intake", "Documents", "Validation", "Applying"] as const;

export interface JourneyStepArgs {
  incompleteSections: number;
  required: number;
  changesRequired: number;
  allApproved: boolean;
  submissionState: SubmissionState;
}

export interface JourneyStep {
  stepIndex: number;
  owner: "You" | "Your team";
}

// Where the client sits on the 5-stage journey, and whether the next
// move is theirs or their team's — one combined read over the same
// checklist/submission data already shown on the dashboard
// (docs/OUR_USER_FLOW.md Phases 2-5). Onboarding (step 1) is already
// behind the client by the time they have a dashboard at all, so the
// steps that can be "current" start at 2.
export function getJourneyStep(args: JourneyStepArgs): JourneyStep {
  const { incompleteSections, required, changesRequired, allApproved, submissionState } = args;

  if (incompleteSections > 0) return { stepIndex: 2, owner: "You" };
  if (required > 0 || changesRequired > 0) return { stepIndex: 3, owner: "You" };
  if (submissionState !== "awaiting_validation") return { stepIndex: 5, owner: "Your team" };
  if (allApproved) return { stepIndex: 4, owner: "Your team" };
  return { stepIndex: 3, owner: "Your team" };
}
