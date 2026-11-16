import { test } from "node:test";
import assert from "node:assert/strict";
import { getChecklistStore } from "../checklist-store.ts";
import { sampleChecklistUpdates } from "./sample-checklist.ts";

test("sample checklist covers every template item, one of each status", () => {
  const ids = getChecklistStore().getChecklist("uid-sample").map((item) => item.id);
  const updates = sampleChecklistUpdates(0);
  assert.deepEqual(Object.keys(updates).sort(), [...ids].sort());
  assert.deepEqual(
    new Set(Object.values(updates).map((update) => update.status)),
    new Set(["required", "submitted", "under_review", "changes_required", "approved"])
  );
});
