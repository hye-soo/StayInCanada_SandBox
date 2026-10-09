import { test } from "node:test";
import assert from "node:assert/strict";
import { getChecklistStore } from "./checklist-store.ts";

test("a never-before-seen client gets a fresh checklist, all items required", () => {
  const store = getChecklistStore();
  const items = store.getChecklist("uid-fresh-1");

  assert.ok(items.length > 0);
  for (const item of items) {
    assert.ok(item.label);
    assert.ok(item.whyNeeded);
    assert.equal(item.status, "required");
    assert.equal(item.fileName, undefined);
    assert.equal(item.aiReport, undefined);
  }
});

test("the same client gets the same checklist on repeated access (not reseeded)", () => {
  const store = getChecklistStore();
  const first = store.getChecklist("uid-fresh-2");
  store.updateItem("uid-fresh-2", { ...first[0]!, status: "submitted" });

  const second = store.getChecklist("uid-fresh-2");
  assert.equal(second[0]!.status, "submitted");
});

test("getItem finds a seeded item by id", () => {
  const store = getChecklistStore();
  const item = store.getItem("uid-fresh-3", "passport");
  assert.ok(item);
  assert.equal(item.id, "passport");
});

test("getItem returns undefined for an unknown item id", () => {
  const store = getChecklistStore();
  assert.equal(store.getItem("uid-fresh-4", "not-a-real-item"), undefined);
});

test("updateItem replaces the item's data in place", () => {
  const store = getChecklistStore();
  const item = store.getItem("uid-fresh-5", "passport");
  assert.ok(item);

  store.updateItem("uid-fresh-5", { ...item, status: "submitted", fileName: "p.pdf" });

  const updated = store.getItem("uid-fresh-5", "passport");
  assert.equal(updated?.status, "submitted");
  assert.equal(updated?.fileName, "p.pdf");
});

test("getAllItemsByStatus finds matching items across multiple clients", () => {
  const store = getChecklistStore();

  const clientAItem = store.getItem("uid-cross-a", "passport")!;
  store.updateItem("uid-cross-a", { ...clientAItem, status: "submitted" });

  const clientBItem = store.getItem("uid-cross-b", "passport")!;
  store.updateItem("uid-cross-b", { ...clientBItem, status: "submitted" });

  const submitted = store.getAllItemsByStatus("submitted");
  const clientIds = submitted.map((entry) => entry.clientId);

  assert.ok(clientIds.includes("uid-cross-a"));
  assert.ok(clientIds.includes("uid-cross-b"));
  for (const entry of submitted) {
    assert.equal(entry.item.status, "submitted");
  }
});
