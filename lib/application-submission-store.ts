import type { SubmissionState } from "./application-submission-transitions.ts";

export interface ApplicationSubmissionStore {
  getState(clientId: string): SubmissionState;
  setState(clientId: string, state: SubmissionState): void;
}

// ponytail: in-memory map keyed by client uid, same pattern as
// lib/checklist-store.ts. Defaults to "ready" — whether a client is
// actually ready (all checklist items approved) is derived elsewhere
// (lib/application-stage.ts), not stored here.
class InMemoryApplicationSubmissionStore implements ApplicationSubmissionStore {
  private readonly stateByClient = new Map<string, SubmissionState>();

  getState(clientId: string): SubmissionState {
    return this.stateByClient.get(clientId) ?? "ready";
  }

  setState(clientId: string, state: SubmissionState): void {
    this.stateByClient.set(clientId, state);
  }
}

let store: ApplicationSubmissionStore | undefined;

export function getApplicationSubmissionStore(): ApplicationSubmissionStore {
  if (!store) store = new InMemoryApplicationSubmissionStore();
  return store;
}
