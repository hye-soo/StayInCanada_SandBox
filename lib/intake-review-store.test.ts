import { test } from "node:test";
import assert from "node:assert/strict";
import { getIntakeReviewStore } from "./intake-review-store.ts";

test("marking a section reviewed is per client and can be undone", () => {
  const store = getIntakeReviewStore();
  store.markReviewed("uid-review-1", "personal");

  assert.ok(store.getReviewed("uid-review-1").has("personal"));
  assert.equal(store.getReviewed("uid-review-2").size, 0);

  store.clearReviewed("uid-review-1", "personal");
  assert.equal(store.getReviewed("uid-review-1").has("personal"), false);
});
