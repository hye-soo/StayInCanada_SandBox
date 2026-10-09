import { test } from "node:test";
import assert from "node:assert/strict";
import { getChecklistStore } from "./checklist-store.ts";

test("seeded Student visa checklist has items with a reason, covering every status", () => {
  const store = getChecklistStore();
  const items = store.getChecklist("mock-client-1");

  assert.ok(items.length > 0);
  for (const item of items) {
    assert.ok(item.label);
    assert.ok(item.whyNeeded);
  }

  const statuses = new Set(items.map((item) => item.status));
  const allStatuses = [
    "required",
    "submitted",
    "under_review",
    "changes_required",
    "approved",
  ] as const;
  for (const status of allStatuses) {
    assert.ok(statuses.has(status), `missing status: ${status}`);
  }
});

test("unknown client has no checklist", () => {
  const store = getChecklistStore();
  assert.deepEqual(store.getChecklist("nobody"), []);
});

test("getItem finds a seeded item by id", () => {
  const store = getChecklistStore();
  const item = store.getItem("mock-client-1", "passport");
  assert.ok(item);
  assert.equal(item.id, "passport");
});

test("getItem returns undefined for an unknown item or client", () => {
  const store = getChecklistStore();
  assert.equal(store.getItem("mock-client-1", "not-a-real-item"), undefined);
  assert.equal(store.getItem("nobody", "passport"), undefined);
});

test("updateItem replaces the item's data in place", () => {
  const store = getChecklistStore();
  const item = store.getItem("mock-client-1", "passport");
  assert.ok(item);

  store.updateItem("mock-client-1", { ...item, status: "submitted", fileName: "p.pdf" });

  const updated = store.getItem("mock-client-1", "passport");
  assert.equal(updated?.status, "submitted");
  assert.equal(updated?.fileName, "p.pdf");
});
