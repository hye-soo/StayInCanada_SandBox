import type { ChecklistItemStatus } from "./types.ts";

export const STATUS_LABEL: Record<ChecklistItemStatus, string> = {
  required: "Required",
  submitted: "Submitted",
  under_review: "Under review",
  changes_required: "Changes required",
  approved: "Approved",
};

export interface StatusNextStep {
  // "rcic" here means "the company side" internally — client-facing
  // copy (whatHappensNext, and the page's own display mapping) stays
  // worded as "Staff" deliberately, so clients never see org structure.
  whoseTurn: "client" | "rcic" | "none";
  whatHappensNext: string;
}

export const STATUS_NEXT_STEP: Record<ChecklistItemStatus, StatusNextStep> = {
  required: {
    whoseTurn: "client",
    whatHappensNext: "Upload this document to continue.",
  },
  submitted: {
    whoseTurn: "rcic",
    whatHappensNext: "Staff will review what you submitted.",
  },
  under_review: {
    whoseTurn: "rcic",
    whatHappensNext: "Staff is currently reviewing this document.",
  },
  changes_required: {
    whoseTurn: "client",
    whatHappensNext: "Review the comment below and re-upload.",
  },
  approved: {
    whoseTurn: "none",
    whatHappensNext: "This item is complete, no action needed.",
  },
};

// Each status maps to its own bg/foreground token pair, defined in
// app/globals.css (amber/blue/violet/red/green), verified >= 4.5:1
// contrast in both light and dark mode. See docs/PHASE1_SLICE_A.md.
export const STATUS_BADGE_CLASS: Record<ChecklistItemStatus, string> = {
  required: "bg-status-required text-status-required-foreground",
  submitted: "bg-status-submitted text-status-submitted-foreground",
  under_review: "bg-status-under-review text-status-under-review-foreground",
  changes_required:
    "bg-status-changes-required text-status-changes-required-foreground",
  approved: "bg-status-approved text-status-approved-foreground",
};
