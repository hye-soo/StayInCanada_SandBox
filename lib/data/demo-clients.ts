import type { ChecklistItemStatus } from "../types.ts";

// Demo only: extra clients so the staff screens (overview, all clients,
// review queue) look like a real caseload. They can't sign in; Alice is
// still the one client you can walk through. Every name and email is
// invented.
export interface DemoClient {
  id: string;
  name: string;
  email: string;
  applicationId: string;
  applicationType: string;
  advisor: string;
  // Passport, letter of acceptance, proof of funds, statement of purpose,
  // language test, in checklist order.
  documents: [ChecklistItemStatus, ChecklistItemStatus, ChecklistItemStatus, ChecklistItemStatus, ChecklistItemStatus];
  intake: "submitted" | "in_progress" | "not_started";
  // How many intake sections staff have already marked reviewed.
  reviewedSections: number;
  daysAgo: number;
}

const ME = "Maya Patel";
const OTHER = "Alex Morgan";

export const DEMO_CLIENTS: DemoClient[] = [
  { id: "client-jordan-lee", name: "Jordan Lee", email: "jordan@example.com", applicationId: "FO-2026-021", applicationType: "Work permit", advisor: ME, documents: ["approved", "approved", "submitted", "approved", "approved"], intake: "submitted", reviewedSections: 0, daysAgo: 2 },
  { id: "client-sam-rivera", name: "Sam Rivera", email: "sam@example.com", applicationId: "FO-2026-032", applicationType: "Visitor extension", advisor: ME, documents: ["approved", "approved", "changes_required", "submitted", "required"], intake: "submitted", reviewedSections: 8, daysAgo: 1 },
  { id: "client-avery-park", name: "Avery Park", email: "avery@example.com", applicationId: "FO-2026-039", applicationType: "Study permit", advisor: ME, documents: ["approved", "approved", "approved", "approved", "approved"], intake: "submitted", reviewedSections: 8, daysAgo: 5 },
  { id: "client-taylor-morgan", name: "Taylor Morgan", email: "taylor@example.com", applicationId: "FO-2026-042", applicationType: "Work permit", advisor: OTHER, documents: ["submitted", "required", "required", "required", "required"], intake: "in_progress", reviewedSections: 0, daysAgo: 0 },
  { id: "client-alex-patel", name: "Alex Patel", email: "alex@example.com", applicationId: "FO-2026-047", applicationType: "Visitor extension", advisor: ME, documents: ["approved", "under_review", "under_review", "approved", "approved"], intake: "submitted", reviewedSections: 8, daysAgo: 3 },
  { id: "client-jamie-wilson", name: "Jamie Wilson", email: "jamie@example.com", applicationId: "FO-2026-053", applicationType: "Study permit", advisor: OTHER, documents: ["approved", "approved", "approved", "under_review", "approved"], intake: "submitted", reviewedSections: 8, daysAgo: 4 },
  { id: "client-ari-patel", name: "Ari Patel", email: "ari@example.com", applicationId: "FO-2026-058", applicationType: "Study permit extension", advisor: ME, documents: ["approved", "approved", "under_review", "approved", "approved"], intake: "submitted", reviewedSections: 8, daysAgo: 6 },
  { id: "client-casey-nguyen", name: "Casey Nguyen", email: "casey@example.com", applicationId: "FO-2026-061", applicationType: "Work permit", advisor: OTHER, documents: ["required", "required", "required", "required", "required"], intake: "not_started", reviewedSections: 0, daysAgo: 0 },
  { id: "client-riley-singh", name: "Riley Singh", email: "riley@example.com", applicationId: "FO-2026-066", applicationType: "Study permit extension", advisor: ME, documents: ["approved", "submitted", "approved", "approved", "required"], intake: "submitted", reviewedSections: 4, daysAgo: 1 },
  { id: "client-morgan-diaz", name: "Morgan Diaz", email: "morgan@example.com", applicationId: "FO-2026-070", applicationType: "Visitor extension", advisor: OTHER, documents: ["changes_required", "approved", "approved", "approved", "approved"], intake: "submitted", reviewedSections: 8, daysAgo: 2 },
  { id: "client-quinn-baker", name: "Quinn Baker", email: "quinn@example.com", applicationId: "FO-2026-074", applicationType: "Study permit", advisor: ME, documents: ["approved", "approved", "approved", "approved", "submitted"], intake: "submitted", reviewedSections: 6, daysAgo: 3 },
];
