import { test } from "node:test";
import assert from "node:assert/strict";
import { getNextChecklistItem } from "./checklist-next-action.ts";
import type { ChecklistItem } from "./types.ts";

function makeItem(overrides: Partial<ChecklistItem> = {}): ChecklistItem {
  return { id: "x", label: "X", whyNeeded: "", status: "required", ...overrides };
}

test("a changes_required item wins over a plain required one", () => {
  const changes = makeItem({ id: "a", status: "changes_required" });
  const required = makeItem({ id: "b", status: "required" });
  assert.equal(getNextChecklistItem([required, changes])?.id, "a");
});

test("falls back to the first required item when nothing needs changes", () => {
  const approved = makeItem({ id: "a", status: "approved" });
  const required = makeItem({ id: "b", status: "required" });
  assert.equal(getNextChecklistItem([approved, required])?.id, "b");
});

test("returns undefined when nothing needs the client's attention", () => {
  const approved = makeItem({ id: "a", status: "approved" });
  const underReview = makeItem({ id: "b", status: "under_review" });
  assert.equal(getNextChecklistItem([approved, underReview]), undefined);
});
