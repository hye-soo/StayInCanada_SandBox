import { test } from "node:test";
import assert from "node:assert/strict";
import { getQuestionnaireStore } from "./questionnaire-store.ts";

test("a never-before-seen client gets a fresh, empty draft", () => {
  const store = getQuestionnaireStore();
  const draft = store.getDraft("uid-q-1");

  assert.deepEqual(draft.applicantInfo, {});
  assert.deepEqual(draft.employment, []);
  assert.deepEqual(draft.children, []);
  assert.deepEqual(draft.siblings, []);
  assert.deepEqual(draft.travelHistory, { entries: [] });
  assert.deepEqual(draft.parents, { mother: {}, father: {} });
});

test("updateSection replaces just that section, leaving others untouched", () => {
  const store = getQuestionnaireStore();
  store.updateSection("uid-q-2", "applicantInfo", { firstName: "Jordan" });

  const draft = store.getDraft("uid-q-2");
  assert.equal(draft.applicantInfo.firstName, "Jordan");
  assert.deepEqual(draft.employment, []);
});

test("the same client's draft persists across repeated access", () => {
  const store = getQuestionnaireStore();
  store.updateSection("uid-q-3", "applicantInfo", { lastName: "Lee" });

  const draft = store.getDraft("uid-q-3");
  assert.equal(draft.applicantInfo.lastName, "Lee");
});

test("getLastSavedAt is unset until the first save, then updates on each save", () => {
  const store = getQuestionnaireStore();
  assert.equal(store.getLastSavedAt("uid-q-5"), undefined);

  const before = Date.now();
  store.updateSection("uid-q-5", "applicantInfo", { firstName: "Jordan" });
  const savedAt = store.getLastSavedAt("uid-q-5");

  assert.ok(savedAt);
  assert.ok(savedAt >= before);
});

test("different clients have independent drafts", () => {
  const store = getQuestionnaireStore();
  store.updateSection("uid-q-4a", "applicantInfo", { firstName: "A" });
  store.updateSection("uid-q-4b", "applicantInfo", { firstName: "B" });

  assert.equal(store.getDraft("uid-q-4a").applicantInfo.firstName, "A");
  assert.equal(store.getDraft("uid-q-4b").applicantInfo.firstName, "B");
});
