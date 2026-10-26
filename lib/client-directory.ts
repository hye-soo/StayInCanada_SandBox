import { getChecklistStore } from "./checklist-store.ts";
import { getClientChecklist, VISA_TYPE_LABEL } from "./client-checklist.ts";
import { getClientQuestionnaire } from "./client-questionnaire.ts";
import { getSectionStatus } from "./questionnaire-progress.ts";
import { SECTION_LABELS } from "./questionnaire-fields.ts";
import { getApplicationStage, type ApplicationStageInfo } from "./application-stage.ts";
import { getApplicationSubmissionStore } from "./application-submission-store.ts";
import type { ApplicationSubmission } from "./application-submission-transitions.ts";
import { STATUS_LABEL } from "./status-display.ts";
import type { ChecklistItemStatus, QuestionnaireSectionId, VisaType } from "./types.ts";

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

const SECTION_IDS = Object.keys(SECTION_LABELS) as QuestionnaireSectionId[];

// Pure aggregation over the existing per-client stores — no new data
// model, just a combined read for the Admin/RCIC client list and
// per-client detail pages (docs/IMPLEMENTATION_PLAN.md Phase 4).
export function getClientSummary(clientId: string): ClientSummary {
  const { visaType, items } = getClientChecklist(clientId);
  const questionnaire = getClientQuestionnaire(clientId);

  const questionnaireComplete = SECTION_IDS.filter(
    (sectionId) => getSectionStatus(questionnaire, sectionId) === "complete"
  ).length;

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
    questionnaireComplete,
    questionnaireTotal: SECTION_IDS.length,
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

const ITEM_OWNER: Record<Exclude<ChecklistItemStatus, "approved">, ItemOwner> = {
  required: "Client",
  submitted: "Admin",
  under_review: "RCIC",
  changes_required: "Client",
};

export interface NeedsAttentionRow {
  clientId: string;
  itemLabel: string;
  statusLabel: string;
  owner: ItemOwner;
}

// Cross-client "needs attention" table for the Admin/RCIC workspace
// overview — every checklist item that isn't approved yet.
export function getNeedsAttentionRows(): NeedsAttentionRow[] {
  const rows: NeedsAttentionRow[] = [];
  for (const clientId of getChecklistStore().getAllClientIds()) {
    const { items } = getClientChecklist(clientId);
    for (const item of items) {
      if (item.status === "approved") continue;
      rows.push({
        clientId,
        itemLabel: item.label,
        statusLabel: STATUS_LABEL[item.status],
        owner: ITEM_OWNER[item.status],
      });
    }
  }
  return rows;
}
