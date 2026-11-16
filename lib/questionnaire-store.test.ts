import { test } from "node:test";
import assert from "node:assert/strict";
import { getQuestionnaireStore } from "./questionnaire-store.ts";

test("a never-before-seen client has no answers yet", () => {
  assert.deepEqual(getQuestionnaireStore().getAnswers("uid-q-1"), {});
});

test("saveStep replaces just that step, leaving others untouched", () => {
  const store = getQuestionnaireStore();
  store.saveStep("uid-q-2", "legal-identity", { values: { firstName: "Jordan" } });
  store.saveStep("uid-q-2", "passport", { values: { passportNumber: "X1" } });
  store.saveStep("uid-q-2", "legal-identity", { values: { firstName: "Jo" } });

  const answers = store.getAnswers("uid-q-2");
  assert.equal(answers["legal-identity"]?.values.firstName, "Jo");
  assert.equal(answers.passport?.values.passportNumber, "X1");
});

test("different clients have independent answers", () => {
  const store = getQuestionnaireStore();
  store.saveStep("uid-q-4a", "legal-identity", { values: { firstName: "A" } });
  assert.deepEqual(store.getAnswers("uid-q-4b"), {});
});

test("getLastSavedAt is unset until the first save", () => {
  const store = getQuestionnaireStore();
  assert.equal(store.getLastSavedAt("uid-q-5"), undefined);
  const before = Date.now();
  store.saveStep("uid-q-5", "legal-identity", { values: {} });
  assert.ok((store.getLastSavedAt("uid-q-5") ?? 0) >= before);
});

test("getSubmittedAt is unset until markSubmitted is called", () => {
  const store = getQuestionnaireStore();
  assert.equal(store.getSubmittedAt("uid-q-6"), undefined);
  const before = Date.now();
  store.markSubmitted("uid-q-6");
  assert.ok((store.getSubmittedAt("uid-q-6") ?? 0) >= before);
});

test("markReviewStarted keeps the first time the review was opened", () => {
  const store = getQuestionnaireStore();
  assert.equal(store.getReviewStartedAt("uid-q-7"), undefined);
  store.markReviewStarted("uid-q-7");
  const first = store.getReviewStartedAt("uid-q-7");
  assert.ok(first !== undefined);
  store.markReviewStarted("uid-q-7");
  assert.equal(store.getReviewStartedAt("uid-q-7"), first);
});
