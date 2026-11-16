import { getQuestionnaireStore } from "./questionnaire-store.ts";
import { getQuestionnaireFlagStore } from "./questionnaire-flag-store.ts";
import { getStep, type IntakeAnswers, type StepAnswer } from "./intake.ts";

export function getClientIntake(clientId: string): IntakeAnswers {
  return getQuestionnaireStore().getAnswers(clientId);
}

// Re-saving a step in a flagged category counts as addressing it — same
// auto-clear-on-resubmit behavior as a flagged checklist document.
export function saveClientIntakeStep(clientId: string, stepId: string, answer: StepAnswer): void {
  getQuestionnaireStore().saveStep(clientId, stepId, answer);
  const step = getStep(stepId);
  if (step) getQuestionnaireFlagStore().clearFlag(clientId, step.category);
}

export function getClientQuestionnaireLastSavedAt(clientId: string): number | undefined {
  return getQuestionnaireStore().getLastSavedAt(clientId);
}

export function submitClientQuestionnaire(clientId: string): void {
  getQuestionnaireStore().markSubmitted(clientId);
}

export function getClientQuestionnaireSubmittedAt(clientId: string): number | undefined {
  return getQuestionnaireStore().getSubmittedAt(clientId);
}

export function markClientReviewStarted(clientId: string): void {
  getQuestionnaireStore().markReviewStarted(clientId);
}

export function getClientReviewStartedAt(clientId: string): number | undefined {
  return getQuestionnaireStore().getReviewStartedAt(clientId);
}
