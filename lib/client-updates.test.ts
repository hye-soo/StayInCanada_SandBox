import { test } from "node:test";
import assert from "node:assert/strict";
import { getClientUpdateRows } from "./client-updates.ts";
import type { ChecklistItem } from "./types.ts";

function makeItem(overrides: Partial<ChecklistItem> = {}): ChecklistItem {
  return { id: "x", label: "Passport", whyNeeded: "", status: "required", ...overrides };
}

test("a changes_required item becomes an action row using the staff comment", () => {
  const [row] = getClientUpdateRows([
    makeItem({ status: "changes_required", staffComment: "Resubmit the full page." }),
  ]);
  assert.equal(row.needsAction, true);
  assert.equal(row.description, "Resubmit the full page.");
});

test("approved items become non-action rows", () => {
  const [row] = getClientUpdateRows([makeItem({ status: "approved" })]);
  assert.equal(row.needsAction, false);
});

test("action rows are sorted before non-action rows", () => {
  const rows = getClientUpdateRows([
    makeItem({ id: "a", status: "approved" }),
    makeItem({ id: "b", status: "required" }),
  ]);
  assert.deepEqual(rows.map((r) => r.itemId), ["b", "a"]);
});
