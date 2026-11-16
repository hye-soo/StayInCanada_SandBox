import type { IntakeCategoryId } from "./data/intake-steps.ts";

export interface QuestionnaireFlagStore {
  setFlag(clientId: string, section: IntakeCategoryId, note: string): void;
  clearFlag(clientId: string, section: IntakeCategoryId): void;
  getFlags(clientId: string): Partial<Record<IntakeCategoryId, string>>;
}

// ponytail: one flag per intake category (a string note), not a thread — same
// shape as the checklist's single staffComment field. Admin is the
// only role that can flag an intake category (docs/DECISIONS.md
// 2026-10-26: Admin does all client-facing operational work).
class InMemoryQuestionnaireFlagStore implements QuestionnaireFlagStore {
  private readonly flagsByClient = new Map<string, Partial<Record<IntakeCategoryId, string>>>();

  setFlag(clientId: string, section: IntakeCategoryId, note: string): void {
    const flags = this.flagsByClient.get(clientId) ?? {};
    flags[section] = note;
    this.flagsByClient.set(clientId, flags);
  }

  clearFlag(clientId: string, section: IntakeCategoryId): void {
    const flags = this.flagsByClient.get(clientId);
    if (flags) delete flags[section];
  }

  getFlags(clientId: string): Partial<Record<IntakeCategoryId, string>> {
    return this.flagsByClient.get(clientId) ?? {};
  }
}

let store: QuestionnaireFlagStore | undefined;

export function getQuestionnaireFlagStore(): QuestionnaireFlagStore {
  if (!store) store = new InMemoryQuestionnaireFlagStore();
  return store;
}

// Demo only: forget every client's state.
export function resetQuestionnaireFlagStore(): void {
  store = undefined;
}
