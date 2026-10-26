import { test } from "node:test";
import assert from "node:assert/strict";
import { getClientSummary, getAllClientSummaries } from "./client-directory.ts";
import { getChecklistStore } from "./checklist-store.ts";
import { updateClientQuestionnaireSection } from "./client-questionnaire.ts";

test("a fresh client summary: all checklist items required, no questionnaire sections complete", () => {
  const summary = getClientSummary("uid-directory-fresh");

  assert.equal(summary.clientId, "uid-directory-fresh");
  assert.equal(summary.visaType, "student");
  assert.ok(summary.checklistCounts.required > 0);
  assert.equal(summary.checklistCounts.approved, 0);
  assert.equal(summary.questionnaireComplete, 0);
  assert.ok(summary.questionnaireTotal > 0);
  assert.equal(summary.stage.stage, "gathering_information");
  assert.equal(summary.submissionState, "ready");
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
