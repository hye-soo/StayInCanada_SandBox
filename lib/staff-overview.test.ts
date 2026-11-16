import { test } from "node:test";
import assert from "node:assert/strict";
import { getAdminOverview, type OverviewClient } from "./staff-overview.ts";
import type { ChecklistItem, ChecklistItemStatus } from "./types.ts";

function item(id: string, status: ChecklistItemStatus, extra: Partial<ChecklistItem> = {}): ChecklistItem {
  return { id, label: id[0]!.toUpperCase() + id.slice(1), whyNeeded: "", status, ...extra };
}

function client(clientId: string, items: ChecklistItem[]): OverviewClient {
  return { clientId, name: `Name ${clientId}`, applicationId: `FO-${clientId}`, visaTypeLabel: "Study permit", items };
}

test("summary counts cover active cases, items to review and clients to chase", () => {
  const overview = getAdminOverview([
    client("a", [item("passport", "submitted", { submittedAt: 2 }), item("funds", "required")]),
    client("b", [item("passport", "approved")]),
  ]);
  assert.equal(overview.activeCases, 2);
  assert.equal(overview.awaitingReview, 1);
  assert.equal(overview.waitingOnClients, 1);
});

test("the review queue lists submitted items oldest first, re-uploads as version comparisons", () => {
  const overview = getAdminOverview([
    client("a", [item("passport", "submitted", { submittedAt: 20, previousUpload: { fileName: "old.pdf", fileSize: 1 } })]),
    client("b", [item("transcript", "submitted", { submittedAt: 10 })]),
  ]);

  assert.deepEqual(
    overview.reviewQueue.map((row) => [row.clientId, row.needsReview, row.actionLabel, row.href]),
    [
      ["b", "Transcript", "Review document", "/admin/b/checklist"],
      ["a", "Replacement passport", "Compare versions", "/admin/a/checklist"],
    ]
  );
});

test("follow-up cards show who owes documents and who is with the consultant", () => {
  const overview = getAdminOverview([
    client("a", [item("funds", "changes_required"), item("passport", "required")]),
    client("b", [item("passport", "under_review"), item("funds", "under_review")]),
  ]);

  assert.deepEqual(overview.waitingOnClient[0], {
    clientId: "a",
    clientName: "Name a",
    detail: "Funds · Changes requested",
    href: "/admin/a",
  });
  assert.deepEqual(overview.readyForConsultant[0], {
    clientId: "b",
    clientName: "Name b",
    detail: "Study permit · 2 documents with RCIC",
    href: "/admin/b",
  });
});
