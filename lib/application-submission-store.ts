import type { ApplicationSubmission } from "./application-submission-transitions.ts";

export interface ApplicationSubmissionStore {
  get(clientId: string): ApplicationSubmission;
  set(clientId: string, submission: ApplicationSubmission): void;
}

function defaultSubmission(): ApplicationSubmission {
  return { state: "awaiting_validation" };
}

// ponytail: in-memory map keyed by client uid, same pattern as the
// other stores. Whether a client is actually ready to be validated
// (all checklist items approved) is derived elsewhere
// (lib/application-stage.ts), not stored here.
class InMemoryApplicationSubmissionStore implements ApplicationSubmissionStore {
  private readonly submissionsByClient = new Map<string, ApplicationSubmission>();

  get(clientId: string): ApplicationSubmission {
    return this.submissionsByClient.get(clientId) ?? defaultSubmission();
  }

  set(clientId: string, submission: ApplicationSubmission): void {
    this.submissionsByClient.set(clientId, submission);
  }
}

let store: ApplicationSubmissionStore | undefined;

export function getApplicationSubmissionStore(): ApplicationSubmissionStore {
  if (!store) store = new InMemoryApplicationSubmissionStore();
  return store;
}
