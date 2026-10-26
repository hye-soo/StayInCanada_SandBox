// Phase 4b/5 (per the RCIC workspace wireframe, docs/DECISIONS.md
// 2026-10-26): RCIC validates the whole client's requirements once
// every checklist item is individually approved (per-item
// approve/request-changes is unchanged — this is an additional,
// holistic sign-off, not a replacement) -> Admin prepares a package
// -> RCIC gives the package a final approval -> RCIC records the
// actual (external, manual) IRCC submission.
export type SubmissionState =
  | "awaiting_validation"
  | "validated"
  | "package_prepared"
  | "approved_for_submission"
  | "submitted_to_ircc";

export interface SubmissionPackage {
  version: number;
  preparedBy: string;
  preparedAt: number;
}

export interface SubmissionRecord {
  submittedBy: string;
  submissionDate: string;
  channel: string;
  irccReference: string;
  receiptFileName?: string;
  recordedAt: number;
}

export interface ApplicationSubmission {
  state: SubmissionState;
  lastNote?: string;
  package?: SubmissionPackage;
  record?: SubmissionRecord;
}

export type SubmissionAction =
  | { type: "validate"; note?: string }
  | { type: "return_with_changes"; note: string }
  | { type: "prepare_package"; preparedBy: string }
  | { type: "approve_package"; note?: string }
  | { type: "return_package_for_correction"; note: string }
  | {
      type: "record_submission";
      submittedBy: string;
      submissionDate: string;
      channel: string;
      irccReference: string;
      receiptFileName?: string;
    };

export interface SubmissionTransitionResult {
  submission?: ApplicationSubmission;
  error?: string;
}

// Whether every checklist item is actually approved (the precondition
// for "validate") is checked by the caller (lib/apply-submission-
// action.ts), not here — this only enforces the state machine's own
// ordering.
export function transitionSubmission(
  current: ApplicationSubmission,
  action: SubmissionAction
): SubmissionTransitionResult {
  switch (action.type) {
    case "validate": {
      if (current.state !== "awaiting_validation") {
        return { error: `Cannot validate from state "${current.state}".` };
      }
      return { submission: { ...current, state: "validated", lastNote: action.note } };
    }
    case "return_with_changes": {
      if (current.state !== "awaiting_validation") {
        return { error: `Cannot return from state "${current.state}".` };
      }
      return { submission: { ...current, lastNote: action.note } };
    }
    case "prepare_package": {
      if (current.state !== "validated") {
        return { error: `Cannot prepare a package from state "${current.state}".` };
      }
      return {
        submission: {
          ...current,
          state: "package_prepared",
          package: {
            version: (current.package?.version ?? 0) + 1,
            preparedBy: action.preparedBy,
            preparedAt: Date.now(),
          },
        },
      };
    }
    case "approve_package": {
      if (current.state !== "package_prepared") {
        return { error: `Cannot approve a package from state "${current.state}".` };
      }
      return { submission: { ...current, state: "approved_for_submission", lastNote: action.note } };
    }
    case "return_package_for_correction": {
      if (current.state !== "package_prepared") {
        return { error: `Cannot return a package from state "${current.state}".` };
      }
      return { submission: { ...current, state: "validated", lastNote: action.note } };
    }
    case "record_submission": {
      if (current.state !== "approved_for_submission") {
        return { error: `Cannot record a submission from state "${current.state}".` };
      }
      return {
        submission: {
          ...current,
          state: "submitted_to_ircc",
          record: {
            submittedBy: action.submittedBy,
            submissionDate: action.submissionDate,
            channel: action.channel,
            irccReference: action.irccReference,
            receiptFileName: action.receiptFileName,
            recordedAt: Date.now(),
          },
        },
      };
    }
  }
}
