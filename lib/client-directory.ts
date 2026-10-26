import { getChecklistStore } from "./checklist-store.ts";
import { getClientChecklist, VISA_TYPE_LABEL } from "./client-checklist.ts";
import { getClientQuestionnaire } from "./client-questionnaire.ts";
import { getSectionStatus } from "./questionnaire-progress.ts";
import { SECTION_LABELS } from "./questionnaire-fields.ts";
import { getApplicationStage, type ApplicationStageInfo } from "./application-stage.ts";
import { getApplicationSubmissionStore } from "./application-submission-store.ts";
import type { SubmissionState } from "./application-submission-transitions.ts";
import type { ChecklistItemStatus, QuestionnaireSectionId, VisaType } from "./types.ts";

export interface ClientSummary {
  clientId: string;
  visaType: VisaType;
  visaTypeLabel: string;
  questionnaireComplete: number;
  questionnaireTotal: number;
  checklistCounts: Record<ChecklistItemStatus, number>;
  stage: ApplicationStageInfo;
  submissionState: SubmissionState;
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
    submissionState: getApplicationSubmissionStore().getState(clientId),
  };
}

export function getAllClientSummaries(): ClientSummary[] {
  return getChecklistStore()
    .getAllClientIds()
    .map((clientId) => getClientSummary(clientId));
}
