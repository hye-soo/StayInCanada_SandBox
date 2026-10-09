import { test } from "node:test";
import assert from "node:assert/strict";
import { getClientChecklist, getClientChecklistItem } from "./client-checklist.ts";

test("returns a client's visa type and checklist items", () => {
  const result = getClientChecklist("uid-client-checklist-1");
  assert.equal(result.visaType, "student");
  assert.ok(result.items.length > 0);
});

test("finds a single checklist item for a client by id", () => {
  assert.ok(getClientChecklistItem("uid-client-checklist-2", "passport"));
  assert.equal(getClientChecklistItem("uid-client-checklist-2", "not-a-real-item"), undefined);
});

test("different clients have independent checklists", () => {
  const a = getClientChecklistItem("uid-client-checklist-a", "passport")!;
  const b = getClientChecklistItem("uid-client-checklist-b", "passport")!;
  assert.deepEqual(a, b); // both fresh, same shape
  assert.equal(a.status, "required");
});
