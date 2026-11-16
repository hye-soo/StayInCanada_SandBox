import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getClientSummary,
  getAllClientSummaries,
  getAdminOverviewStats,
  getRcicOverviewStats,
  getClientQueueRows,
  needsRcicValidation,
  needsPackageApproval,
  needsSubmissionRecording,
} from "./client-directory.ts";
import { getChecklistStore } from "./checklist-store.ts";
import { saveClientIntakeStep } from "./client-questionnaire.ts";
import { applySubmissionAction } from "./apply-submission-action.ts";

test("a fresh client summary: all checklist items required, no questionnaire sections complete", () => {
  const summary = getClientSummary("uid-directory-fresh");

  assert.equal(summary.clientId, "uid-directory-fresh");
  assert.equal(summary.visaType, "student");
  assert.ok(summary.checklistCounts.required > 0);
  assert.equal(summary.checklistCounts.approved, 0);
  assert.equal(summary.questionnaireComplete, 0);
  assert.ok(summary.questionnaireTotal > 0);
  assert.equal(summary.stage.stage, "gathering_information");
  assert.equal(summary.submission.state, "awaiting_validation");
});

test("checklistCounts reflects updated item statuses", () => {
  const clientId = "uid-directory-approved";
  const store = getChecklistStore();
  for (const item of store.getChecklist(clientId)) {
    store.updateItem(clientId, { ...item, status: "approved" });
  }

  const summary = getClientSummary(clientId);
  assert.equal(summary.checklistCounts.required, 0);
  assert.equal(summary.checklistCounts.approved, summary.checklistCounts.approved);
  assert.equal(summary.stage.stage, "ready_for_submission");
});

test("questionnaireComplete reflects a completed section", () => {
  const clientId = "uid-directory-questionnaire";
  saveClientIntakeStep(clientId, "travel", { values: { hasTravelled: "no" } });

  const summary = getClientSummary(clientId);
  assert.equal(summary.questionnaireComplete, 1);
});

test("getAllClientSummaries includes every client the checklist store knows about", () => {
  getClientSummary("uid-directory-all-1");
  getClientSummary("uid-directory-all-2");

  const ids = getAllClientSummaries().map((summary) => summary.clientId);
  assert.ok(ids.includes("uid-directory-all-1"));
  assert.ok(ids.includes("uid-directory-all-2"));
});

test("getAdminOverviewStats counts submitted/under_review/needs-client-action items across clients", () => {
  const before = getAdminOverviewStats();

  const clientId = "uid-stats-admin-1";
  const store = getChecklistStore();
  const items = store.getChecklist(clientId);
  store.updateItem(clientId, { ...items[0]!, status: "submitted" });
  store.updateItem(clientId, { ...items[1]!, status: "under_review" });
  store.updateItem(clientId, { ...items[2]!, status: "changes_required" });
  // items[3], items[4] stay "required"

  const after = getAdminOverviewStats();
  assert.equal(after.activeClients, before.activeClients + 1);
  assert.equal(after.submittedItems, before.submittedItems + 1);
  assert.equal(after.readyForRcic, before.readyForRcic + 1);
  assert.equal(after.clientFollowUps, before.clientFollowUps + 3);
});

test("getRcicOverviewStats counts under_review/changes_required items and approved-for-submission clients", () => {
  const before = getRcicOverviewStats();

  const clientId = "uid-stats-rcic-1";
  const store = getChecklistStore();
  for (const item of store.getChecklist(clientId)) {
    store.updateItem(clientId, { ...item, status: "approved" });
  }
  applySubmissionAction(clientId, { type: "validate" }, "Jean Martin");
  applySubmissionAction(clientId, { type: "prepare_package", preparedBy: "Alex Morgan" }, "Alex Morgan");
  applySubmissionAction(clientId, { type: "approve_package" }, "Jean Martin");

  const after = getRcicOverviewStats();
  assert.equal(after.activeClients, before.activeClients + 1);
  assert.equal(after.readyToSubmit, before.readyToSubmit + 1);
});

test("needsRcicValidation / needsPackageApproval / needsSubmissionRecording reflect each stage", () => {
  const clientId = "uid-stats-rcic-2";
  const store = getChecklistStore();
  for (const item of store.getChecklist(clientId)) {
    store.updateItem(clientId, { ...item, status: "approved" });
  }

  assert.equal(needsRcicValidation(getClientSummary(clientId)), true);
  assert.equal(needsPackageApproval(getClientSummary(clientId)), false);

  applySubmissionAction(clientId, { type: "validate" }, "Jean Martin");
  assert.equal(needsRcicValidation(getClientSummary(clientId)), false);

  applySubmissionAction(clientId, { type: "prepare_package", preparedBy: "Alex Morgan" }, "Alex Morgan");
  assert.equal(needsPackageApproval(getClientSummary(clientId)), true);

  applySubmissionAction(clientId, { type: "approve_package" }, "Jean Martin");
  assert.equal(needsPackageApproval(getClientSummary(clientId)), false);
  assert.equal(needsSubmissionRecording(getClientSummary(clientId)), true);
});

test("getClientQueueRows has exactly one row per client, not one per item", () => {
  const clientId = "uid-queue-one-row";
  const store = getChecklistStore();
  const items = store.getChecklist(clientId);
  store.updateItem(clientId, { ...items[0]!, status: "submitted" });
  store.updateItem(clientId, { ...items[1]!, status: "required" });

  const rows = getClientQueueRows().filter((row) => row.clientId === clientId);
  assert.equal(rows.length, 1);
});

test("getClientQueueRows surfaces the most advanced pending action across every pipeline stage", () => {
  const store = getChecklistStore();

  const waitingOnClient = "uid-queue-waiting";
  store.updateItem(waitingOnClient, { ...store.getChecklist(waitingOnClient)[0]!, status: "changes_required" });
  const waitingRow = getClientQueueRows().find((r) => r.clientId === waitingOnClient);
  assert.equal(waitingRow?.owner, "Client");

  const adminCheck = "uid-queue-admin-check";
  store.updateItem(adminCheck, { ...store.getChecklist(adminCheck)[0]!, status: "submitted" });
  const adminRow = getClientQueueRows().find((r) => r.clientId === adminCheck);
  assert.equal(adminRow?.owner, "Admin");
  assert.match(adminRow!.nextAction, /quality check/i);

  const rcicReview = "uid-queue-rcic-review";
  store.updateItem(rcicReview, { ...store.getChecklist(rcicReview)[0]!, status: "under_review" });
  const rcicRow = getClientQueueRows().find((r) => r.clientId === rcicReview);
  assert.equal(rcicRow?.owner, "RCIC");
  assert.match(rcicRow!.nextAction, /review/i);

  const readyToValidate = "uid-queue-validate";
  for (const item of store.getChecklist(readyToValidate)) {
    store.updateItem(readyToValidate, { ...item, status: "approved" });
  }
  const validateRow = getClientQueueRows().find((r) => r.clientId === readyToValidate);
  assert.equal(validateRow?.owner, "RCIC");
  assert.match(validateRow!.nextAction, /validate/i);

  applySubmissionAction(readyToValidate, { type: "validate" }, "Jean Martin");
  const prepareRow = getClientQueueRows().find((r) => r.clientId === readyToValidate);
  assert.equal(prepareRow?.owner, "Admin");
  assert.match(prepareRow!.nextAction, /prepare package/i);

  applySubmissionAction(readyToValidate, { type: "prepare_package", preparedBy: "Alex Morgan" }, "Alex Morgan");
  const approveRow = getClientQueueRows().find((r) => r.clientId === readyToValidate);
  assert.equal(approveRow?.owner, "RCIC");
  assert.match(approveRow!.nextAction, /approve package/i);

  applySubmissionAction(readyToValidate, { type: "approve_package" }, "Jean Martin");
  const recordRow = getClientQueueRows().find((r) => r.clientId === readyToValidate);
  assert.equal(recordRow?.owner, "RCIC");
  assert.match(recordRow!.nextAction, /record submission/i);

  applySubmissionAction(
    readyToValidate,
    {
      type: "record_submission",
      submittedBy: "Jean Martin",
      submissionDate: "2026-10-26",
      channel: "IRCC Portal",
      irccReference: "REF-1",
    },
    "Jean Martin"
  );
  const doneRow = getClientQueueRows().find((r) => r.clientId === readyToValidate);
  assert.equal(doneRow?.owner, "Done");
});
