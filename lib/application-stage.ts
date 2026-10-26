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

// Phase 5 (docs/OUR_USER_FLOW.md): once Admin/RCIC act on the
// submission state, that overrides the plain checklist-derived stage
// for the client's own display — "ready for submission" becomes
// "packaged" / "submitted to IRCC" instead.
export function getDashboardStage(
  items: ChecklistItem[],
  submissionState: SubmissionState
): ApplicationStageInfo {
  if (submissionState === "packaged") {
    return {
      stage: "ready_for_submission",
      label: "Packaged for RCIC",
      description:
        "Your file has been packaged and is with your RCIC for a final review before submission to IRCC.",
    };
  }
  if (submissionState === "submitted_to_ircc") {
    return {
      stage: "ready_for_submission",
      label: "Submitted to IRCC",
      description: "Your application has been submitted to IRCC. We'll update you here once there's news.",
    };
  }
  return getApplicationStage(items);
}
