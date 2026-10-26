import { test } from "node:test";
import assert from "node:assert/strict";
import { applySubmissionAction } from "./apply-submission-action.ts";
import { getApplicationSubmissionStore } from "./application-submission-store.ts";
import { getActivityLogStore } from "./activity-log-store.ts";
import { getChecklistStore } from "./checklist-store.ts";

function approveAllItems(clientId: string) {
  const store = getChecklistStore();
  for (const item of store.getChecklist(clientId)) {
    store.updateItem(clientId, { ...item, status: "approved" });
  }
}

test("validate is rejected when checklist items aren't all approved yet", () => {
  const result = applySubmissionAction("uid-submit-1", { type: "validate" }, "Jean Martin");
  assert.ok(result.error);
  assert.equal(getApplicationSubmissionStore().get("uid-submit-1").state, "awaiting_validation");
});

test("validate succeeds once every checklist item is approved, and logs it", () => {
  const clientId = "uid-submit-2";
  approveAllItems(clientId);

  const result = applySubmissionAction(clientId, { type: "validate" }, "Jean Martin");
  assert.equal(result.error, undefined);
  assert.equal(result.submission?.state, "validated");

  const [entry] = getActivityLogStore().getForClient(clientId);
  assert.match(entry!.message, /validated by Jean Martin/);
});

test("the full chain: validate -> prepare -> approve -> record, each logged", () => {
  const clientId = "uid-submit-3";
  approveAllItems(clientId);

  applySubmissionAction(clientId, { type: "validate" }, "Jean Martin");
  const prepared = applySubmissionAction(
    clientId,
    { type: "prepare_package", preparedBy: "Alex Morgan" },
    "Alex Morgan"
  );
  assert.equal(prepared.submission?.state, "package_prepared");

  const approved = applySubmissionAction(
    clientId,
    { type: "approve_package" },
    "Jean Martin"
  );
  assert.equal(approved.submission?.state, "approved_for_submission");

  const recorded = applySubmissionAction(
    clientId,
    {
      type: "record_submission",
      submittedBy: "Jean Martin",
      submissionDate: "2026-10-20",
      channel: "IRCC online account",
      irccReference: "DEMO-2026-014",
    },
    "Jean Martin"
  );
  assert.equal(recorded.submission?.state, "submitted_to_ircc");

  const messages = getActivityLogStore()
    .getForClient(clientId)
    .map((entry) => entry.message);
  assert.equal(messages.length, 4);
  assert.match(messages[0]!, /submission and receipt recorded/i);
  assert.match(messages[1]!, /approved package v1/);
  assert.match(messages[2]!, /prepared package v1/);
  assert.match(messages[3]!, /validated by Jean Martin/);
});

test("a rejected transition is not persisted or logged", () => {
  const clientId = "uid-submit-4";
  const before = getActivityLogStore().getForClient(clientId).length;

  const result = applySubmissionAction(
    clientId,
    { type: "prepare_package", preparedBy: "Alex Morgan" },
    "Alex Morgan"
  );

  assert.ok(result.error);
  assert.equal(getApplicationSubmissionStore().get(clientId).state, "awaiting_validation");
  assert.equal(getActivityLogStore().getForClient(clientId).length, before);
});
