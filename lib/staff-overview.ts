import type { ChecklistItem } from "./types.ts";

export interface OverviewClient {
  clientId: string;
  name: string;
  applicationId: string;
  visaTypeLabel: string;
  items: ChecklistItem[];
}

export interface ReviewQueueRow {
  clientId: string;
  clientName: string;
  applicationId: string;
  itemId: string;
  needsReview: string;
  receivedAt?: number;
  actionLabel: string;
  href: string;
}

export interface CaseEntry {
  clientId: string;
  clientName: string;
  detail: string;
  href: string;
}

export interface AdminOverview {
  activeCases: number;
  awaitingReview: number;
  waitingOnClients: number;
  reviewQueue: ReviewQueueRow[];
  waitingOnClient: CaseEntry[];
  readyForConsultant: CaseEntry[];
}

// Figma "S01 Staff dashboard" for Admin: submitted documents are
// Admin's quality-check queue, outstanding/flagged items mean the
// client owes something, and forwarded (under_review) items sit with
// the RCIC.
export function getAdminOverview(clients: OverviewClient[]): AdminOverview {
  const reviewQueue: ReviewQueueRow[] = clients
    .flatMap(({ clientId, name, applicationId, items }) =>
      items
        .filter((item) => item.status === "submitted")
        .map((item) => ({
          clientId,
          clientName: name,
          applicationId,
          itemId: item.id,
          needsReview: item.previousUpload ? `Replacement ${item.label.toLowerCase()}` : item.label,
          receivedAt: item.submittedAt,
          actionLabel: item.previousUpload ? "Compare versions" : "Review document",
          href: `/admin/${clientId}/checklist`,
        }))
    )
    .sort((a, b) => (a.receivedAt ?? Infinity) - (b.receivedAt ?? Infinity));

  const waitingOnClient: CaseEntry[] = [];
  const readyForConsultant: CaseEntry[] = [];
  for (const { clientId, name, visaTypeLabel, items } of clients) {
    const owed =
      items.find((item) => item.status === "changes_required") ??
      items.find((item) => item.status === "required");
    if (owed) {
      waitingOnClient.push({
        clientId,
        clientName: name,
        detail: `${owed.label} · ${owed.status === "changes_required" ? "Changes requested" : "Not uploaded yet"}`,
        href: `/admin/${clientId}`,
      });
    }

    const withRcic = items.filter((item) => item.status === "under_review").length;
    if (withRcic > 0) {
      readyForConsultant.push({
        clientId,
        clientName: name,
        detail: `${visaTypeLabel} · ${withRcic} document${withRcic === 1 ? "" : "s"} with RCIC`,
        href: `/admin/${clientId}`,
      });
    }
  }

  return {
    activeCases: clients.length,
    awaitingReview: reviewQueue.length,
    waitingOnClients: waitingOnClient.length,
    reviewQueue,
    waitingOnClient,
    readyForConsultant,
  };
}
