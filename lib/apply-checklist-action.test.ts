import { test } from "node:test";
import assert from "node:assert/strict";
import { applyChecklistAction } from "./apply-checklist-action.ts";
import { getChecklistStore } from "./checklist-store.ts";
import { MOCK_CLIENT_ID } from "./current-client.ts";

test("returns an error for an unknown item", () => {
  const result = applyChecklistAction("not-a-real-item", { type: "approve" });
  assert.ok(result.error);
});

test("applies a valid action and persists it via the store", () => {
  const result = applyChecklistAction("proof-of-funds", {
    type: "request_changes",
    comment: "Bank letter is expired.",
  });

  assert.equal(result.error, undefined);
  assert.equal(result.item?.status, "changes_required");

  const persisted = getChecklistStore().getItem(MOCK_CLIENT_ID, "proof-of-funds");
  assert.equal(persisted?.status, "changes_required");
  assert.equal(persisted?.staffComment, "Bank letter is expired.");
});

test("does not persist anything when the action is rejected", () => {
  const before = getChecklistStore().getItem(MOCK_CLIENT_ID, "language-test");
  const result = applyChecklistAction("language-test", {
    type: "upload",
    file: { name: "huge.pdf", size: 10 * 1024 * 1024 },
  });

  assert.ok(result.error);
  const after = getChecklistStore().getItem(MOCK_CLIENT_ID, "language-test");
  assert.deepEqual(after, before);
});
