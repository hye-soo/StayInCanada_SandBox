import { test } from "node:test";
import assert from "node:assert/strict";
import { getIntakeReviewRows } from "./intake-review.ts";

test("each category's review state comes from completion, flags and staff review", () => {
  const { rows, reviewedCount, total } = getIntakeReviewRows(
    { personal: "complete", family: "complete", address: "complete", education: "in_progress" },
    { address: "Add your 2019 address" },
    new Set(["personal"])
  );

  const byId = Object.fromEntries(rows.map((row) => [row.categoryId, row]));
  assert.equal(byId.personal?.status, "reviewed");
  assert.equal(byId.personal?.label, "Personal");
  assert.equal(byId.family?.status, "needs_review");
  assert.equal(byId.family?.context, "Client answers received");
  assert.equal(byId.address?.status, "sent_back");
  assert.equal(byId.address?.context, "Sent back: Add your 2019 address");
  assert.equal(byId.education?.status, "waiting");
  assert.equal(reviewedCount, 1);
  assert.equal(total, 8);
});

test("categories the client hasn't finished are waiting even if never reviewed", () => {
  const { rows } = getIntakeReviewRows({}, {}, new Set());
  assert.ok(rows.every((row) => row.status === "waiting"));
});
