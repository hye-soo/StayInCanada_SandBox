import { test } from "node:test";
import assert from "node:assert/strict";
import { buildReviewQueue } from "./review-queue.ts";
import type { ChecklistItem } from "./types.ts";

const doc = (id: string, status: ChecklistItem["status"], submittedAt?: number, previous = false): ChecklistItem => ({
  id,
  label: id === "passport" ? "Passport" : "Proof of Financial Support",
  whyNeeded: "",
  status,
  submittedAt,
  previousUpload: previous ? { fileName: "old.pdf", fileSize: 1 } : undefined,
});

test("review queue: submitted documents and intake sections needing review, oldest first", () => {
  const queue = buildReviewQueue([
    {
      clientId: "a",
      name: "Alice Chang",
      applicationId: "FO-1",
      items: [doc("passport", "submitted", 300, true), doc("proof-of-funds", "approved", 100)],
      intakeSubmittedAt: 200,
      intakeSections: [
        { categoryId: "personal", label: "Personal", status: "needs_review" },
        { categoryId: "family", label: "Family", status: "reviewed" },
      ],
    },
    {
      clientId: "b",
      name: "Sam Rivera",
      applicationId: "FO-2",
      items: [doc("proof-of-funds", "submitted", 50)],
      intakeSubmittedAt: undefined,
      intakeSections: [{ categoryId: "personal", label: "Personal", status: "needs_review" }],
    },
  ]);

  assert.deepEqual(
    queue.map((item) => [item.clientId, item.kind, item.title, item.href]),
    [
      ["b", "document", "Proof of Financial Support \u00b7 v1", "/admin/review-queue/b/proof-of-funds"],
      ["a", "intake", "Intake · Personal", "/admin/a/intake/personal"],
      ["a", "document", "Passport \u00b7 v2", "/admin/review-queue/a/passport"],
    ]
  );
  assert.equal(queue[2]!.actionLabel, "Compare versions");
});
