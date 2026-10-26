import { test } from "node:test";
import assert from "node:assert/strict";
import { getApplicationStage } from "./application-stage.ts";
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
