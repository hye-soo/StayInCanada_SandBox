import { test } from "node:test";
import assert from "node:assert/strict";
import { applyChecklistAction } from "./apply-checklist-action.ts";
import { getChecklistStore } from "./checklist-store.ts";

test("returns an error for an unknown item id", () => {
  const result = applyChecklistAction("uid-apply-1", "not-a-real-item", { type: "approve" });
  assert.ok(result.error);
});

test("applies a valid action and persists it via the store, scoped to the right client", () => {
  const result = applyChecklistAction("uid-apply-2", "proof-of-funds", {
    type: "request_changes",
    comment: "Bank letter is expired.",
  });

  assert.equal(result.error, undefined);
  assert.equal(result.item?.status, "changes_required");

  const persisted = getChecklistStore().getItem("uid-apply-2", "proof-of-funds");
  assert.equal(persisted?.status, "changes_required");
  assert.equal(persisted?.rcicComment, "Bank letter is expired.");

  // A different client's copy of the same item id is untouched.
  const otherClient = getChecklistStore().getItem("uid-apply-3", "proof-of-funds");
  assert.equal(otherClient?.status, "required");
});

test("does not persist anything when the action is rejected", () => {
  const before = getChecklistStore().getItem("uid-apply-4", "language-test");
  const result = applyChecklistAction("uid-apply-4", "language-test", {
    type: "upload",
    file: { name: "huge.pdf", size: 10 * 1024 * 1024 },
  });

  assert.ok(result.error);
  const after = getChecklistStore().getItem("uid-apply-4", "language-test");
  assert.deepEqual(after, before);
});
