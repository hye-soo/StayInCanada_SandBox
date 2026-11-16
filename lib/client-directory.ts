import { getChecklistStore } from "./checklist-store.ts";
import { getClientChecklist, VISA_TYPE_LABEL } from "./client-checklist.ts";
import { getClientIntake } from "./client-questionnaire.ts";
import { getIntakeProgress } from "./intake.ts";
import { getApplicationStage, type ApplicationStageInfo } from "./application-stage.ts";
import { getApplicationSubmissionStore } from "./application-submission-store.ts";
import type { ApplicationSubmission } from "./application-submission-transitions.ts";
import type { ChecklistItemStatus, VisaType } from "./types.ts";

export interface ClientSummary {
  clientId: string;
  visaType: VisaType;
  visaTypeLabel: string;
  questionnaireComplete: number;
  questionnaireTotal: number;
  checklistCounts: Record<ChecklistItemStatus, number>;
  stage: ApplicationStageInfo;
  submission: ApplicationSubmission;
}

// Pure aggregation over the existing per-client stores — no new data
// model, just a combined read for the Admin/RCIC client list and
// per-client detail pages (docs/IMPLEMENTATION_PLAN.md Phase 4).
export function getClientSummary(clientId: string): ClientSummary {
  const { visaType, items } = getClientChecklist(clientId);
  const { completeCategories, totalCategories } = getIntakeProgress(getClientIntake(clientId));

  const checklistCounts: Record<ChecklistItemStatus, number> = {
    required: 0,
    submitted: 0,
    under_review: 0,
    changes_required: 0,
    approved: 0,
  };
  for (const item of items) checklistCounts[item.status]++;

  return {
    clientId,
    visaType,
    visaTypeLabel: VISA_TYPE_LABEL[visaType],
    // Intake progress is counted in categories (Personal, Family, …).
    questionnaireComplete: completeCategories,
    questionnaireTotal: totalCategories,
    checklistCounts,
    stage: getApplicationStage(items),
    submission: getApplicationSubmissionStore().get(clientId),
  };
}

export function getAllClientSummaries(): ClientSummary[] {
  return getChecklistStore()
    .getAllClientIds()
    .map((clientId) => getClientSummary(clientId));
}

export interface AdminOverviewStats {
  activeClients: number;
  submittedItems: number;
  clientFollowUps: number;
  readyForRcic: number;
}

// Per docs/CURRENT_USER_FLOW_V2.md's Admin role: triage submitted
// documents, flag what's missing, forward reviewed items to RCIC.
export function getAdminOverviewStats(): AdminOverviewStats {
  const summaries = getAllClientSummaries();
  let submittedItems = 0;
  let clientFollowUps = 0;
  let readyForRcic = 0;
  for (const summary of summaries) {
    submittedItems += summary.checklistCounts.submitted;
    readyForRcic += summary.checklistCounts.under_review;
    clientFollowUps += summary.checklistCounts.required + summary.checklistCounts.changes_required;
  }
  return { activeClients: summaries.length, submittedItems, clientFollowUps, readyForRcic };
}

export interface RcicOverviewStats {
  activeClients: number;
  awaitingReview: number;
  changesRequested: number;
  readyToSubmit: number;
}

// Per docs/CURRENT_USER_FLOW_V2.md's RCIC role: final review/approval,
// and (Phase 5) sending the packaged file to IRCC.
export function getRcicOverviewStats(): RcicOverviewStats {
  const summaries = getAllClientSummaries();
  let awaitingReview = 0;
  let changesRequested = 0;
  let readyToSubmit = 0;
  for (const summary of summaries) {
    awaitingReview += summary.checklistCounts.under_review;
    changesRequested += summary.checklistCounts.changes_required;
    if (summary.submission.state === "approved_for_submission") readyToSubmit++;
  }
  return { activeClients: summaries.length, awaitingReview, changesRequested, readyToSubmit };
}

// RCIC's "Final reviews" vs "Applications" lists (per the RCIC
// workspace wireframe, docs/DECISIONS.md 2026-10-26).
export function needsRcicValidation(summary: ClientSummary): boolean {
  return summary.submission.state === "awaiting_validation" && summary.stage.stage === "ready_for_submission";
}

export function needsPackageApproval(summary: ClientSummary): boolean {
  return summary.submission.state === "package_prepared";
}

export function needsSubmissionRecording(summary: ClientSummary): boolean {
  return summary.submission.state === "approved_for_submission";
}

export type ItemOwner = "Client" | "Admin" | "RCIC";

export interface ClientQueueRow {
  clientId: string;
  stageLabel: string;
  nextAction: string;
  owner: ItemOwner | "Done";
}

// What a staff member should do next for this client, right now — one
// decision per client (not per item), in pipeline order so the
// furthest-along pending step wins when several items are mid-flight
// at once (per-item review already happens in parallel; this is just
// which single action is most useful to surface on the overview).
function getNextAction(summary: ClientSummary): { nextAction: string; owner: ItemOwner | "Done" } {
  const { submission, checklistCounts } = summary;
  if (submission.state === "approved_for_submission") {
    return { nextAction: "Record submission to IRCC", owner: "RCIC" };
  }
  if (submission.state === "package_prepared") {
    return { nextAction: "Approve package for submission", owner: "RCIC" };
  }
  if (submission.state === "validated") {
    return { nextAction: "Prepare package", owner: "Admin" };
  }
  if (submission.state === "submitted_to_ircc") {
    return { nextAction: "Submitted to IRCC — no action needed", owner: "Done" };
  }
  if (needsRcicValidation(summary)) {
    return { nextAction: "Validate requirements & hand off", owner: "RCIC" };
  }
  if (checklistCounts.under_review > 0) {
    return { nextAction: "Review documents", owner: "RCIC" };
  }
  if (checklistCounts.submitted > 0) {
    return { nextAction: "Quality check documents", owner: "Admin" };
  }
  if (checklistCounts.required > 0 || checklistCounts.changes_required > 0) {
    return { nextAction: "Waiting on client", owner: "Client" };
  }
  return { nextAction: "Waiting on client intake", owner: "Client" };
}

// One row per client for the Admin/RCIC workspace overview — the
// previous version listed one row per non-approved checklist item,
// which repeated the same client many times (docs/DECISIONS.md).
export function getClientQueueRows(): ClientQueueRow[] {
  return getAllClientSummaries().map((summary) => {
    const { nextAction, owner } = getNextAction(summary);
    return { clientId: summary.clientId, stageLabel: summary.stage.label, nextAction, owner };
  });
}
