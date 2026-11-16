import type { ChecklistItem } from "../types.ts";

const DAY = 24 * 60 * 60 * 1000;

// Demo only: a mid-way document checklist for the mock client, one item
// in each state (Figma C04), so the checklist can be recorded without
// uploading and reviewing files by hand. File names are invented.
export function sampleChecklistUpdates(now: number = Date.now()): Record<string, Partial<ChecklistItem>> {
  return {
    passport: {
      status: "changes_required",
      fileName: "passport-scan.jpg",
      fileSize: 1_240_000,
      submittedAt: now - 3 * DAY,
      staffComment: "The photo page is cut off at the bottom. Please upload a full, uncropped scan.",
    },
    "letter-of-acceptance": {
      status: "approved",
      fileName: "letter-of-acceptance.pdf",
      fileSize: 420_000,
      submittedAt: now - 6 * DAY,
    },
    "proof-of-funds": { status: "required" },
    "statement-of-purpose": {
      status: "under_review",
      fileName: "statement-of-purpose.pdf",
      fileSize: 180_000,
      submittedAt: now - 2 * DAY,
    },
    "language-test": {
      status: "submitted",
      fileName: "ielts-results.pdf",
      fileSize: 310_000,
      submittedAt: now - DAY,
    },
  };
}
