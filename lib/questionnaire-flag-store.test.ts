import { test } from "node:test";
import assert from "node:assert/strict";
import { getQuestionnaireFlagStore } from "./questionnaire-flag-store.ts";

test("a client with no flags has an empty flags object", () => {
  assert.deepEqual(getQuestionnaireFlagStore().getFlags("uid-flag-empty"), {});
});

test("setFlag records a note for that section only", () => {
  const store = getQuestionnaireFlagStore();
  store.setFlag("uid-flag-1", "personal", "Expiry date looks wrong.");

  assert.equal(store.getFlags("uid-flag-1").personal, "Expiry date looks wrong.");
  assert.equal(store.getFlags("uid-flag-1").family, undefined);
});

test("clearFlag removes just that section's flag", () => {
  const store = getQuestionnaireFlagStore();
  store.setFlag("uid-flag-2", "personal", "fix this");
  store.setFlag("uid-flag-2", "family", "fix that");

  store.clearFlag("uid-flag-2", "personal");

  const flags = store.getFlags("uid-flag-2");
  assert.equal(flags.personal, undefined);
  assert.equal(flags.family, "fix that");
});

test("different clients have independent flags", () => {
  const store = getQuestionnaireFlagStore();
  store.setFlag("uid-flag-3a", "personal", "a's note");
  store.setFlag("uid-flag-3b", "personal", "b's note");

  assert.equal(store.getFlags("uid-flag-3a").personal, "a's note");
  assert.equal(store.getFlags("uid-flag-3b").personal, "b's note");
});
