import { test } from "node:test";
import assert from "node:assert/strict";
import { getChecklistSummary, getIntakeSummary } from "./overview-summary.ts";
import type { ChecklistItem, ChecklistItemStatus } from "./types.ts";

function items(...statuses: ChecklistItemStatus[]): ChecklistItem[] {
  return statuses.map((status, i) => ({ id: `i${i}`, label: `Item ${i}`, whyNeeded: "", status }));
}

test("intake summary follows section completion", () => {
  assert.deepEqual(getIntakeSummary(0, 12), {
    status: "not_started",
    description: "0 of 12 sections completed",
  });
  assert.equal(getIntakeSummary(5, 12).status, "in_progress");
  assert.equal(getIntakeSummary(12, 12).status, "completed");
});

test("checklist summary lists only the non-zero counts, most urgent first", () => {
  const summary = getChecklistSummary(
    items("changes_required", "required", "submitted", "under_review", "approved")
  );
  assert.equal(summary.status, "in_progress");
  assert.equal(summary.description, "1 needs changes · 1 required · 2 awaiting review");
});

test("checklist with nothing uploaded yet is not started", () => {
  const summary = getChecklistSummary(items("required", "required"));
  assert.equal(summary.status, "not_started");
  assert.equal(summary.description, "2 required");
});

test("checklist with everything approved is completed", () => {
  assert.deepEqual(getChecklistSummary(items("approved", "approved")), {
    status: "completed",
    description: "All 2 documents approved",
  });
});
