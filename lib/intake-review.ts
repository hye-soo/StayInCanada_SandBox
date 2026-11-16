import { INTAKE_CATEGORIES, type IntakeCategoryId } from "./data/intake-steps.ts";
import type { IntakeStatus } from "./intake.ts";

export type IntakeReviewStatus = "reviewed" | "needs_review" | "sent_back" | "waiting";

export const INTAKE_REVIEW_LABEL: Record<IntakeReviewStatus, string> = {
  reviewed: "Reviewed",
  needs_review: "Needs review",
  sent_back: "Sent back",
  waiting: "Waiting on client",
};

export interface IntakeReviewRow {
  categoryId: IntakeCategoryId;
  label: string;
  status: IntakeReviewStatus;
  context: string;
}

// Admin's per-category intake review (Figma "Intake review"): a
// category the client finished needs review until Admin marks it
// reviewed or sends it back with a note.
export function getIntakeReviewRows(
  statusByCategory: Partial<Record<IntakeCategoryId, IntakeStatus>>,
  flags: Partial<Record<IntakeCategoryId, string>>,
  reviewed: ReadonlySet<IntakeCategoryId>
): { rows: IntakeReviewRow[]; reviewedCount: number; total: number } {
  const rows = INTAKE_CATEGORIES.map(({ id, label }): IntakeReviewRow => {
    const flag = flags[id];
    if (flag) return { categoryId: id, label, status: "sent_back", context: `Sent back: ${flag}` };
    if (statusByCategory[id] !== "complete") {
      return { categoryId: id, label, status: "waiting", context: "Not completed by the client yet" };
    }
    return {
      categoryId: id,
      label,
      status: reviewed.has(id) ? "reviewed" : "needs_review",
      context: "Client answers received",
    };
  });

  return {
    rows,
    reviewedCount: rows.filter((row) => row.status === "reviewed").length,
    total: rows.length,
  };
}
