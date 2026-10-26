import type { QuestionnaireResponse, QuestionnaireSectionId } from "./types.ts";

export interface QuestionnaireStore {
  getDraft(clientId: string): QuestionnaireResponse;
  updateSection<K extends QuestionnaireSectionId>(
    clientId: string,
    section: K,
    data: QuestionnaireResponse[K]
  ): void;
  getLastSavedAt(clientId: string): number | undefined;
}

function freshDraft(): QuestionnaireResponse {
  return {
    applicantInfo: {},
    languageTest: {},
    educationAssessment: {},
    passport: {},
    employment: [],
    educationHistory: [],
    addressHistory: [],
    parents: { mother: {}, father: {} },
    children: [],
    siblings: [],
    travelHistory: { entries: [] },
    declaration: {},
  };
}

// ponytail: same lazy-seed-per-client pattern as lib/checklist-store.ts.
// Swap for a Firebase/other-backed store later behind this interface.
class InMemoryQuestionnaireStore implements QuestionnaireStore {
  private readonly draftsByClient = new Map<string, QuestionnaireResponse>();
  private readonly lastSavedAtByClient = new Map<string, number>();

  private ensureClient(clientId: string): QuestionnaireResponse {
    let draft = this.draftsByClient.get(clientId);
    if (!draft) {
      draft = freshDraft();
      this.draftsByClient.set(clientId, draft);
    }
    return draft;
  }

  getDraft(clientId: string): QuestionnaireResponse {
    return this.ensureClient(clientId);
  }

  updateSection<K extends QuestionnaireSectionId>(
    clientId: string,
    section: K,
    data: QuestionnaireResponse[K]
  ): void {
    const draft = this.ensureClient(clientId);
    draft[section] = data;
    this.lastSavedAtByClient.set(clientId, Date.now());
  }

  getLastSavedAt(clientId: string): number | undefined {
    return this.lastSavedAtByClient.get(clientId);
  }
}

let store: QuestionnaireStore | undefined;

export function getQuestionnaireStore(): QuestionnaireStore {
  if (!store) store = new InMemoryQuestionnaireStore();
  return store;
}
