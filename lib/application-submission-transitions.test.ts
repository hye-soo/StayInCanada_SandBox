import { test } from "node:test";
import assert from "node:assert/strict";
import { transitionSubmissionState } from "./application-submission-transitions.ts";

test("ready -> packaged on mark_packaged", () => {
  const result = transitionSubmissionState("ready", { type: "mark_packaged" });
  assert.equal(result.state, "packaged");
  assert.equal(result.error, undefined);
});

test("packaged -> submitted_to_ircc on mark_submitted", () => {
  const result = transitionSubmissionState("packaged", { type: "mark_submitted" });
  assert.equal(result.state, "submitted_to_ircc");
  assert.equal(result.error, undefined);
});

test("mark_packaged is rejected unless current state is ready", () => {
  assert.ok(transitionSubmissionState("packaged", { type: "mark_packaged" }).error);
  assert.ok(transitionSubmissionState("submitted_to_ircc", { type: "mark_packaged" }).error);
});

test("mark_submitted is rejected unless current state is packaged", () => {
  assert.ok(transitionSubmissionState("ready", { type: "mark_submitted" }).error);
  assert.ok(transitionSubmissionState("submitted_to_ircc", { type: "mark_submitted" }).error);
});
