import { test } from "node:test";
import assert from "node:assert/strict";
import { getApplicationStage, getDashboardStage } from "./application-stage.ts";
import type { ChecklistItem } from "./types.ts";

function item(status: ChecklistItem["status"]): ChecklistItem {
  return { id: "x", label: "X", whyNeeded: "because", status };
}

test("any required or changes_required item means still gathering information", () => {
  assert.equal(
    getApplicationStage([item("approved"), item("required")]).stage,
    "gathering_information"
  );
  assert.equal(
    getApplicationStage([item("submitted"), item("changes_required")]).stage,
    "gathering_information"
  );
});

test("no required/changes_required but some submitted/under_review means under review", () => {
  assert.equal(
    getApplicationStage([item("approved"), item("submitted")]).stage,
    "under_review"
  );
  assert.equal(
    getApplicationStage([item("under_review"), item("approved")]).stage,
    "under_review"
  );
});

test("every item approved means ready for submission", () => {
  assert.equal(
    getApplicationStage([item("approved"), item("approved")]).stage,
    "ready_for_submission"
  );
});

test("an empty checklist defaults to gathering information", () => {
  assert.equal(getApplicationStage([]).stage, "gathering_information");
});

test("getDashboardStage falls back to the checklist-derived stage while awaiting validation", () => {
  const items = [item("approved"), item("required")];
  assert.equal(getDashboardStage(items, "awaiting_validation").stage, "gathering_information");
});

test("getDashboardStage overrides the label once RCIC has validated requirements", () => {
  const info = getDashboardStage([item("approved")], "validated");
  assert.match(info.label, /validated|review/i);
});

test("getDashboardStage overrides the label once Admin has prepared the package", () => {
  const info = getDashboardStage([item("approved")], "package_prepared");
  assert.match(info.label, /package/i);
});

test("getDashboardStage overrides the label once RCIC has approved the package", () => {
  const info = getDashboardStage([item("approved")], "approved_for_submission");
  assert.match(info.label, /approved/i);
});

test("getDashboardStage overrides the label once RCIC has submitted to IRCC", () => {
  const info = getDashboardStage([item("approved")], "submitted_to_ircc");
  assert.match(info.label, /ircc/i);
});
