import { test } from "node:test";
import assert from "node:assert/strict";
import { MAX_UPLOAD_BYTES, transitionChecklistItem } from "./checklist-transitions.ts";
import type { ChecklistItem } from "./types.ts";

function makeItem(overrides: Partial<ChecklistItem> = {}): ChecklistItem {
  return {
    id: "passport",
    label: "Passport",
    whyNeeded: "Identity check.",
    status: "required",
    ...overrides,
  };
}

test("upload within the size limit marks the item submitted with a mock AI report", () => {
  const item = makeItem();
  const result = transitionChecklistItem(item, {
    type: "upload",
    file: { name: "passport.pdf", size: 1024 },
  });

  assert.equal(result.error, undefined);
  assert.equal(result.item?.status, "submitted");
  assert.equal(result.item?.fileName, "passport.pdf");
  assert.equal(result.item?.fileSize, 1024);
  assert.ok(result.item?.aiReport);
  assert.ok(result.item?.aiFormSuggestion);
});

test("upload over the size limit is rejected and leaves the item unchanged", () => {
  const item = makeItem();
  const result = transitionChecklistItem(item, {
    type: "upload",
    file: { name: "huge.pdf", size: MAX_UPLOAD_BYTES + 1 },
  });

  assert.equal(result.item, undefined);
  assert.ok(result.error);
  assert.equal(item.status, "required");
});

test("upload clears any previous staff comment", () => {
  const item = makeItem({ status: "changes_required", staffComment: "fix the date" });
  const result = transitionChecklistItem(item, {
    type: "upload",
    file: { name: "passport.pdf", size: 1024 },
  });

  assert.equal(result.item?.staffComment, undefined);
});

test("mark_reviewed forwards a submitted item to RCIC (under_review)", () => {
  const item = makeItem({ status: "submitted" });
  const result = transitionChecklistItem(item, { type: "mark_reviewed" });
  assert.equal(result.item?.status, "under_review");
  assert.equal(result.item?.adminNote, undefined);
});

test("mark_reviewed records admin's optional internal note for RCIC", () => {
  const item = makeItem({ status: "submitted" });
  const result = transitionChecklistItem(item, {
    type: "mark_reviewed",
    note: "AI's suggested spelling looks right to me.",
  });
  assert.equal(result.item?.adminNote, "AI's suggested spelling looks right to me.");
});

test("approve sets the status to approved", () => {
  const item = makeItem({ status: "submitted" });
  const result = transitionChecklistItem(item, { type: "approve" });
  assert.equal(result.item?.status, "approved");
});

test("request_changes sets the status and stores the comment", () => {
  const item = makeItem({ status: "submitted" });
  const result = transitionChecklistItem(item, {
    type: "request_changes",
    comment: "Spelling mismatch on page 1.",
  });
  assert.equal(result.item?.status, "changes_required");
  assert.equal(result.item?.staffComment, "Spelling mismatch on page 1.");
});
