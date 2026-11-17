import type { IntakeCategoryId } from "./data/intake-steps.ts";
import type { IntakeReviewStatus } from "./intake-review.ts";
import type { ChecklistItem } from "./types.ts";

export interface ReviewQueueClient {
  clientId: string;
  name: string;
  applicationId: string;
  items: ChecklistItem[];
  intakeSubmittedAt?: number;
  intakeSections: { categoryId: IntakeCategoryId; label: string; status: IntakeReviewStatus }[];
}

export interface ReviewQueueItem {
  key: string;
  clientId: string;
  clientName: string;
  applicationId: string;
  kind: "document" | "intake";
  title: string;
  receivedAt?: number;
  actionLabel: string;
  href: string;
}

// Staff "Review queue": everything waiting on Admin's check, oldest
// first: uploaded documents (quality check) and, once an intake is
// submitted, each section not yet reviewed.
export function buildReviewQueue(clients: ReviewQueueClient[]): ReviewQueueItem[] {
  return clients
    .flatMap((client): ReviewQueueItem[] => [
      ...client.items
        .filter((item) => item.status === "submitted")
        .map((item) => ({
          key: `${client.clientId}-doc-${item.id}`,
          clientId: client.clientId,
          clientName: client.name,
          applicationId: client.applicationId,
          kind: "document" as const,
          title: item.previousUpload ? `Replacement ${item.label.toLowerCase()}` : item.label,
          receivedAt: item.submittedAt,
          actionLabel: item.previousUpload ? "Compare versions" : "Review document",
          href: `/admin/${client.clientId}/checklist`,
        })),
      ...(client.intakeSubmittedAt
        ? client.intakeSections
            .filter((section) => section.status === "needs_review")
            .map((section) => ({
              key: `${client.clientId}-intake-${section.categoryId}`,
              clientId: client.clientId,
              clientName: client.name,
              applicationId: client.applicationId,
              kind: "intake" as const,
              title: `Intake · ${section.label}`,
              receivedAt: client.intakeSubmittedAt,
              actionLabel: "Review section",
              href: `/admin/${client.clientId}/intake/${section.categoryId}`,
            }))
        : []),
    ])
    .sort((a, b) => (a.receivedAt ?? Infinity) - (b.receivedAt ?? Infinity));
}
