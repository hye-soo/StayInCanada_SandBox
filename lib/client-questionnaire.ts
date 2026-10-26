import { getQuestionnaireStore } from "./questionnaire-store.ts";
import type { QuestionnaireResponse, QuestionnaireSectionId } from "./types.ts";

export function getClientQuestionnaire(clientId: string): QuestionnaireResponse {
  return getQuestionnaireStore().getDraft(clientId);
}

export function updateClientQuestionnaireSection<K extends QuestionnaireSectionId>(
  clientId: string,
  section: K,
  data: QuestionnaireResponse[K]
): void {
  getQuestionnaireStore().updateSection(clientId, section, data);
}

export function getClientQuestionnaireLastSavedAt(clientId: string): number | undefined {
  return getQuestionnaireStore().getLastSavedAt(clientId);
}
