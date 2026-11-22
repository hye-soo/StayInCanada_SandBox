import { test } from "node:test";
import assert from "node:assert/strict";
import { aiCheckLabel, documentVersion, getAiReviewStore, resetAiReviewStore, runAiCheck } from "./ai-review.ts";
import type { ChecklistItem } from "./types.ts";

const passport = (replaced = false): ChecklistItem => ({
  id: "passport",
  label: "Passport",
  whyNeeded: "",
  status: "submitted",
  fileName: replaced ? "v2.pdf" : "v1.pdf",
  previousUpload: replaced ? { fileName: "v1.pdf", fileSize: 1 } : undefined,
});

test("ai check: first passport has a cropped-expiry finding with a draft; the replacement is clean", () => {
  const first = runAiCheck("client-alice", passport());
  assert.equal(first.status, "issue");
  assert.equal(aiCheckLabel(first), "1 possible issue");
  assert.match(first.draftMessage ?? "", /expiry date is cut off/);
  assert.equal(documentVersion(passport()), 1);

  const second = runAiCheck("client-alice", passport(true));
  assert.equal(second.status, "clean");
  assert.ok(second.resolved);
  assert.equal(documentVersion(passport(true)), 2);
});

test("ai check: demo overrides for checking and couldn't-check rows", () => {
  const item = { ...passport(), id: "proof-of-funds" };
  assert.equal(runAiCheck("client-jordan-lee", item).status, "checking");
  assert.equal(runAiCheck("client-riley-singh", { ...item, id: "letter-of-acceptance" }).status, "failed");
  assert.equal(runAiCheck("client-taylor-morgan", passport()).status, "clean");
});

test("ai review store: decisions are per uploaded file; latest approval wins", () => {
  resetAiReviewStore();
  const store = getAiReviewStore();
  store.decide("a", "passport", "v1.pdf", "confirmed");
  assert.equal(store.getDecision("a", "passport", "v1.pdf"), "confirmed");
  assert.equal(store.getDecision("a", "passport", "v2.pdf"), undefined);

  store.approve("a", "passport", "Maya", 1);
  store.approve("b", "passport", "Maya", 2);
  assert.equal(store.latestApproval()?.clientId, "b");
  resetAiReviewStore();
});
