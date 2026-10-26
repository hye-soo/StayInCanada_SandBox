import type { SubmissionState } from "./application-submission-transitions.ts";
import type { ChecklistItem } from "./types.ts";

export type ApplicationStage = "gathering_information" | "under_review" | "ready_for_submission";

export interface ApplicationStageInfo {
  stage: ApplicationStage;
  label: string;
  description: string;
}

const STAGE_INFO: Record<ApplicationStage, Omit<ApplicationStageInfo, "stage">> = {
  gathering_information: {
    label: "Gathering information",
    description: "Your team will review your intake and documents before preparing your application.",
  },
  under_review: {
    label: "Under review",
    description: "Your documents have been submitted and are being reviewed by your team.",
  },
  ready_for_submission: {
    label: "Ready for submission",
    description: "Everything has been approved — your team will prepare the application for submission.",
  },
};

// Derived heuristically from checklist item statuses — there's no
// separate stored "application stage" yet (see docs/IMPLEMENTATION_PLAN.md,
// the IRCC-portal status field is still a Phase 2 must-ship item,
// unbuilt). This is a stand-in, not the real post-submission tracker.
export function getApplicationStage(items: ChecklistItem[]): ApplicationStageInfo {
  const needsClientAction = items.some(
    (item) => item.status === "required" || item.status === "changes_required"
  );

  let stage: ApplicationStage;
  if (items.length === 0 || needsClientAction) {
    stage = "gathering_information";
  } else if (items.every((item) => item.status === "approved")) {
    stage = "ready_for_submission";
  } else {
    stage = "under_review";
  }

  return { stage, ...STAGE_INFO[stage] };
}

const SUBMISSION_DISPLAY: Partial<
  Record<SubmissionState, Omit<ApplicationStageInfo, "stage">>
> = {
  validated: {
    label: "Validated — preparing your file",
    description:
      "Your RCIC has validated your intake and documents. Your team is now preparing your file for submission.",
  },
  package_prepared: {
    label: "Package under final review",
    description:
      "Your file has been prepared and is undergoing a final review by your RCIC before submission.",
  },
  approved_for_submission: {
    label: "Approved for submission",
    description: "Your file has been approved. Your team is finalizing submission to IRCC.",
  },
  submitted_to_ircc: {
    label: "Submitted to IRCC",
    description: "Your application has been submitted to IRCC. We'll update you here once there's news.",
  },
};

// Phase 4b/5 (docs/DECISIONS.md 2026-10-26): once RCIC/Admin move past
// plain checklist approval (validate -> package -> approve -> submit),
// that overrides the checklist-derived stage for the client's own
// display. "awaiting_validation" still falls back to the plain
// checklist-derived stage below.
export function getDashboardStage(
  items: ChecklistItem[],
  submissionState: SubmissionState
): ApplicationStageInfo {
  const override = SUBMISSION_DISPLAY[submissionState];
  if (override) {
    return { stage: "ready_for_submission", ...override };
  }
  return getApplicationStage(items);
}
