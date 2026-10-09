import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getCurrentClientChecklist,
  getCurrentClientChecklistItem,
  getCurrentClientItemsByStatus,
} from "./get-current-client-checklist.ts";

test("returns the current client's visa type and checklist items", () => {
  const result = getCurrentClientChecklist();
  assert.equal(result.visaType, "student");
  assert.ok(result.items.length > 0);
});

test("finds a single checklist item for the current client by id", () => {
  assert.ok(getCurrentClientChecklistItem("passport"));
  assert.equal(getCurrentClientChecklistItem("not-a-real-item"), undefined);
});

test("filters the current client's items by status, for the admin view", () => {
  const submitted = getCurrentClientItemsByStatus("submitted");
  assert.ok(submitted.length > 0);
  for (const item of submitted) {
    assert.equal(item.status, "submitted");
  }
});

test("filters the current client's items by status, for the RCIC view", () => {
  const underReview = getCurrentClientItemsByStatus("under_review");
  assert.ok(underReview.length > 0);
  for (const item of underReview) {
    assert.equal(item.status, "under_review");
  }
});
