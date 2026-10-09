import { MOCK_CLIENT_ID } from "./current-client.ts";
import { MOCK_AI_FORM_SUGGESTION, MOCK_AI_REPORT } from "./checklist-transitions.ts";
import type { ChecklistItem } from "./types.ts";

export interface ChecklistStore {
  getChecklist(clientId: string): ChecklistItem[];
  getItem(clientId: string, itemId: string): ChecklistItem | undefined;
  updateItem(clientId: string, item: ChecklistItem): void;
}

// Placeholder content for the single MVP visa type — confirm the real
// required-document list with the client before this goes further
// than a demo. See docs/IMPLEMENTATION_PLAN.md (Student visa scope).
// Statuses are varied here only to demo the 5-state model end to end.
const STUDENT_VISA_CHECKLIST: ChecklistItem[] = [
  {
    id: "passport",
    label: "Passport",
    whyNeeded: "IRCC needs a valid passport to confirm your identity and nationality.",
    status: "approved",
  },
  {
    id: "letter-of-acceptance",
    label: "Letter of Acceptance",
    whyNeeded: "Proves you're enrolled at a designated learning institution.",
    status: "submitted",
    fileName: "letter-of-acceptance.pdf",
    fileSize: 245_000,
    aiReport: MOCK_AI_REPORT,
    aiFormSuggestion: MOCK_AI_FORM_SUGGESTION,
  },
  {
    id: "proof-of-funds",
    label: "Proof of Financial Support",
    whyNeeded: "IRCC requires evidence you can cover tuition and living costs.",
    status: "under_review",
    fileName: "proof-of-funds.pdf",
    fileSize: 180_000,
    aiReport: MOCK_AI_REPORT,
    aiFormSuggestion: MOCK_AI_FORM_SUGGESTION,
    adminNote: "AI suggestion looked right to me, forwarding for final approval.",
  },
  {
    id: "statement-of-purpose",
    label: "Statement of Purpose",
    whyNeeded: "Explains your study plan and intent to IRCC in your own words.",
    status: "changes_required",
    fileName: "statement-of-purpose.pdf",
    fileSize: 95_000,
    aiReport: MOCK_AI_REPORT,
    aiFormSuggestion: MOCK_AI_FORM_SUGGESTION,
    staffComment: "The dates in your statement don't match your resume. Please review and re-upload.",
  },
  {
    id: "language-test",
    label: "Language Test Results",
    whyNeeded: "IRCC needs proof of English or French proficiency for study permits.",
    status: "required",
  },
];

// ponytail: in-memory map keyed by clientId, seeded for the mock
// client only. Swap this class for a Firebase/other-backed one later
// behind the same ChecklistStore interface — callers don't change.
class InMemoryChecklistStore implements ChecklistStore {
  private readonly checklistsByClient = new Map<string, ChecklistItem[]>([
    [MOCK_CLIENT_ID, STUDENT_VISA_CHECKLIST.map((item) => ({ ...item }))],
  ]);

  getChecklist(clientId: string): ChecklistItem[] {
    return this.checklistsByClient.get(clientId) ?? [];
  }

  getItem(clientId: string, itemId: string): ChecklistItem | undefined {
    return this.getChecklist(clientId).find((item) => item.id === itemId);
  }

  updateItem(clientId: string, item: ChecklistItem): void {
    const items = this.getChecklist(clientId);
    const index = items.findIndex((existing) => existing.id === item.id);
    if (index !== -1) items[index] = item;
  }
}

let store: ChecklistStore | undefined;

export function getChecklistStore(): ChecklistStore {
  if (!store) store = new InMemoryChecklistStore();
  return store;
}
