import type { ChecklistItem, ChecklistItemStatus } from "./types.ts";

export interface ChecklistStore {
  getChecklist(clientId: string): ChecklistItem[];
  getItem(clientId: string, itemId: string): ChecklistItem | undefined;
  updateItem(clientId: string, item: ChecklistItem): void;
  // Admin/RCIC views span every client, not just one.
  getAllItemsByStatus(
    status: ChecklistItemStatus
  ): { clientId: string; item: ChecklistItem }[];
}

// Placeholder content for the single MVP visa type — confirm the real
// required-document list with the client before this goes further
// than a demo. See docs/IMPLEMENTATION_PLAN.md (Student visa scope).
const STUDENT_VISA_CHECKLIST_TEMPLATE: Omit<ChecklistItem, "status">[] = [
  {
    id: "passport",
    label: "Passport",
    whyNeeded: "IRCC needs a valid passport to confirm your identity and nationality.",
  },
  {
    id: "letter-of-acceptance",
    label: "Letter of Acceptance",
    whyNeeded: "Proves you're enrolled at a designated learning institution.",
  },
  {
    id: "proof-of-funds",
    label: "Proof of Financial Support",
    whyNeeded: "IRCC requires evidence you can cover tuition and living costs.",
  },
  {
    id: "statement-of-purpose",
    label: "Statement of Purpose",
    whyNeeded: "Explains your study plan and intent to IRCC in your own words.",
  },
  {
    id: "language-test",
    label: "Language Test Results",
    whyNeeded: "IRCC needs proof of English or French proficiency for study permits.",
  },
];

function freshChecklist(): ChecklistItem[] {
  return STUDENT_VISA_CHECKLIST_TEMPLATE.map((item) => ({
    ...item,
    status: "required" as const,
  }));
}

// ponytail: in-memory map keyed by real Firebase uid, lazily seeded on
// first access per client. Swap this class for a Firebase/other-backed
// one later behind the same ChecklistStore interface — callers don't change.
class InMemoryChecklistStore implements ChecklistStore {
  private readonly checklistsByClient = new Map<string, ChecklistItem[]>();

  private ensureClient(clientId: string): ChecklistItem[] {
    let items = this.checklistsByClient.get(clientId);
    if (!items) {
      items = freshChecklist();
      this.checklistsByClient.set(clientId, items);
    }
    return items;
  }

  getChecklist(clientId: string): ChecklistItem[] {
    return this.ensureClient(clientId);
  }

  getItem(clientId: string, itemId: string): ChecklistItem | undefined {
    return this.getChecklist(clientId).find((item) => item.id === itemId);
  }

  updateItem(clientId: string, item: ChecklistItem): void {
    const items = this.getChecklist(clientId);
    const index = items.findIndex((existing) => existing.id === item.id);
    if (index !== -1) items[index] = item;
  }

  getAllItemsByStatus(
    status: ChecklistItemStatus
  ): { clientId: string; item: ChecklistItem }[] {
    const results: { clientId: string; item: ChecklistItem }[] = [];
    for (const [clientId, items] of this.checklistsByClient) {
      for (const item of items) {
        if (item.status === status) results.push({ clientId, item });
      }
    }
    return results;
  }
}

let store: ChecklistStore | undefined;

export function getChecklistStore(): ChecklistStore {
  if (!store) store = new InMemoryChecklistStore();
  return store;
}
