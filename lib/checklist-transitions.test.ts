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

test("upload clears any previous staff comment and RCIC flag", () => {
  const item = makeItem({
    status: "changes_required",
    staffComment: "fix the date",
    rcicFlagNote: "name mismatch",
  });
  const result = transitionChecklistItem(item, {
    type: "upload",
    file: { name: "passport.pdf", size: 1024 },
  });

  assert.equal(result.item?.staffComment, undefined);
  assert.equal(result.item?.rcicFlagNote, undefined);
});

test("upload over a flagged file keeps the previous attempt as a single prior version", () => {
  const item = makeItem({
    status: "changes_required",
    fileName: "passport-v1.pdf",
    fileSize: 500,
    staffComment: "fix the date",
  });
  const result = transitionChecklistItem(item, {
    type: "upload",
    file: { name: "passport-v2.pdf", size: 1024 },
  });

  assert.deepEqual(result.item?.previousUpload, {
    fileName: "passport-v1.pdf",
    fileSize: 500,
    comment: "fix the date",
  });
  assert.equal(result.item?.fileName, "passport-v2.pdf");
});

test("a first-time upload (nothing to replace) has no previousUpload", () => {
  const item = makeItem();
  const result = transitionChecklistItem(item, {
    type: "upload",
    file: { name: "passport.pdf", size: 1024 },
  });

  assert.equal(result.item?.previousUpload, undefined);
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

// Admin is the sole client-facing gate (docs/DECISIONS.md 2026-10-26,
// superseding the earlier RCIC-only rule): Admin sets the client-visible
// comment, whether from Admin's own quality check or from an RCIC flag.
test("request_changes (Admin) sets the status and stores a client-visible comment", () => {
  const item = makeItem({ status: "submitted" });
  const result = transitionChecklistItem(item, {
    type: "request_changes",
    comment: "Spelling mismatch on page 1.",
  });
  assert.equal(result.item?.status, "changes_required");
  assert.equal(result.item?.staffComment, "Spelling mismatch on page 1.");
});

test("request_changes clears any RCIC flag it's resolving", () => {
  const item = makeItem({ status: "submitted", rcicFlagNote: "name mismatch" });
  const result = transitionChecklistItem(item, {
    type: "request_changes",
    comment: "Please fix your name.",
  });
  assert.equal(result.item?.rcicFlagNote, undefined);
});

// RCIC never contacts the client directly — flagging bounces the item
// back to Admin (status returns to "submitted") with an internal note,
// reusing the existing "submitted = Admin's turn" meaning rather than
// adding a new status.
test("flag_for_admin (RCIC) bounces the item back to Admin with an internal note", () => {
  const item = makeItem({ status: "under_review" });
  const result = transitionChecklistItem(item, {
    type: "flag_for_admin",
    note: "Name on passport doesn't match the intake form.",
  });
  assert.equal(result.item?.status, "submitted");
  assert.equal(result.item?.rcicFlagNote, "Name on passport doesn't match the intake form.");
  assert.equal(result.item?.staffComment, undefined);
});
