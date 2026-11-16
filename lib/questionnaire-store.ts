import type { IntakeAnswers, StepAnswer } from "./intake.ts";

export interface QuestionnaireStore {
  getAnswers(clientId: string): IntakeAnswers;
  saveStep(clientId: string, stepId: string, answer: StepAnswer): void;
  getLastSavedAt(clientId: string): number | undefined;
  markSubmitted(clientId: string): void;
  getSubmittedAt(clientId: string): number | undefined;
  markReviewStarted(clientId: string): void;
  getReviewStartedAt(clientId: string): number | undefined;
}

// ponytail: same in-memory per-client pattern as lib/checklist-store.ts.
// Swap for a Firebase/other-backed store later behind this interface.
class InMemoryQuestionnaireStore implements QuestionnaireStore {
  private readonly answersByClient = new Map<string, IntakeAnswers>();
  private readonly lastSavedAtByClient = new Map<string, number>();
  private readonly submittedAtByClient = new Map<string, number>();
  private readonly reviewStartedAtByClient = new Map<string, number>();

  getAnswers(clientId: string): IntakeAnswers {
    return this.answersByClient.get(clientId) ?? {};
  }

  saveStep(clientId: string, stepId: string, answer: StepAnswer): void {
    this.answersByClient.set(clientId, { ...this.getAnswers(clientId), [stepId]: answer });
    this.lastSavedAtByClient.set(clientId, Date.now());
  }

  getLastSavedAt(clientId: string): number | undefined {
    return this.lastSavedAtByClient.get(clientId);
  }

  // ponytail: a timestamp, not a workflow state — re-editing after
  // submitting doesn't retract it.
  markSubmitted(clientId: string): void {
    this.submittedAtByClient.set(clientId, Date.now());
  }

  getSubmittedAt(clientId: string): number | undefined {
    return this.submittedAtByClient.get(clientId);
  }

  // First time the client opened the review (C03). Until then My Intake
  // keeps showing C10 "Start review"; after, C11 "Continue your review".
  markReviewStarted(clientId: string): void {
    if (!this.reviewStartedAtByClient.has(clientId)) this.reviewStartedAtByClient.set(clientId, Date.now());
  }

  getReviewStartedAt(clientId: string): number | undefined {
    return this.reviewStartedAtByClient.get(clientId);
  }
}

let store: QuestionnaireStore | undefined;

export function getQuestionnaireStore(): QuestionnaireStore {
  if (!store) store = new InMemoryQuestionnaireStore();
  return store;
}

// Demo only: forget every client's state.
export function resetQuestionnaireStore(): void {
  store = undefined;
}
