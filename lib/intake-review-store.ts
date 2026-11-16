import type { IntakeCategoryId } from "./data/intake-steps.ts";

export interface IntakeReviewStore {
  markReviewed(clientId: string, category: IntakeCategoryId): void;
  clearReviewed(clientId: string, category: IntakeCategoryId): void;
  getReviewed(clientId: string): ReadonlySet<IntakeCategoryId>;
}

// ponytail: in-memory, same pattern as the other stores.
class InMemoryIntakeReviewStore implements IntakeReviewStore {
  private readonly reviewedByClient = new Map<string, Set<IntakeCategoryId>>();

  markReviewed(clientId: string, category: IntakeCategoryId): void {
    const reviewed = this.reviewedByClient.get(clientId) ?? new Set();
    reviewed.add(category);
    this.reviewedByClient.set(clientId, reviewed);
  }

  clearReviewed(clientId: string, category: IntakeCategoryId): void {
    this.reviewedByClient.get(clientId)?.delete(category);
  }

  getReviewed(clientId: string): ReadonlySet<IntakeCategoryId> {
    return this.reviewedByClient.get(clientId) ?? new Set();
  }
}

let store: IntakeReviewStore | undefined;

export function getIntakeReviewStore(): IntakeReviewStore {
  if (!store) store = new InMemoryIntakeReviewStore();
  return store;
}

// Demo only: forget every client's state.
export function resetIntakeReviewStore(): void {
  store = undefined;
}
