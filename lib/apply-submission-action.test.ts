import { test } from "node:test";
import assert from "node:assert/strict";
import { applySubmissionAction } from "./apply-submission-action.ts";
import { getApplicationSubmissionStore } from "./application-submission-store.ts";
import { getChecklistStore } from "./checklist-store.ts";

function approveAllItems(clientId: string) {
  const store = getChecklistStore();
  for (const item of store.getChecklist(clientId)) {
    store.updateItem(clientId, { ...item, status: "approved" });
  }
}

test("mark_packaged is rejected when checklist items aren't all approved yet", () => {
  const result = applySubmissionAction("uid-submit-1", { type: "mark_packaged" });
  assert.ok(result.error);
  assert.equal(getApplicationSubmissionStore().getState("uid-submit-1"), "ready");
});

test("mark_packaged succeeds once every checklist item is approved", () => {
  approveAllItems("uid-submit-2");
  const result = applySubmissionAction("uid-submit-2", { type: "mark_packaged" });

  assert.equal(result.error, undefined);
  assert.equal(result.state, "packaged");
  assert.equal(getApplicationSubmissionStore().getState("uid-submit-2"), "packaged");
});

test("mark_submitted succeeds once packaged", () => {
  approveAllItems("uid-submit-3");
  applySubmissionAction("uid-submit-3", { type: "mark_packaged" });

  const result = applySubmissionAction("uid-submit-3", { type: "mark_submitted" });
  assert.equal(result.error, undefined);
  assert.equal(result.state, "submitted_to_ircc");
});

test("mark_submitted is rejected before packaging", () => {
  approveAllItems("uid-submit-4");
  const result = applySubmissionAction("uid-submit-4", { type: "mark_submitted" });
  assert.ok(result.error);
});
