import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getClientSummary,
  getAllClientSummaries,
  getAdminOverviewStats,
  getRcicOverviewStats,
  getNeedsAttentionRows,
  needsRcicValidation,
  needsPackageApproval,
  needsSubmissionRecording,
} from "./client-directory.ts";
import { getChecklistStore } from "./checklist-store.ts";
import { updateClientQuestionnaireSection } from "./client-questionnaire.ts";
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
  updateClientQuestionnaireSection(clientId, "languageTest", { hasTakenTest: "no" });

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

test("getNeedsAttentionRows includes a new client's non-approved items with the right owner", () => {
  const clientId = "uid-attention-1";
  const store = getChecklistStore();
  const items = store.getChecklist(clientId);
  store.updateItem(clientId, { ...items[0]!, status: "submitted" });

  const rows = getNeedsAttentionRows().filter((row) => row.clientId === clientId);
  assert.ok(rows.length > 0);
  const submittedRow = rows.find((row) => row.itemLabel === items[0]!.label);
  assert.equal(submittedRow?.owner, "Admin");
  // approved items never appear
  assert.ok(rows.every((row) => row.statusLabel !== "Approved"));
});
