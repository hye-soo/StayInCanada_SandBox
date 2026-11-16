import type { ChecklistItem } from "./types.ts";

export type ProgressStatus = "not_started" | "in_progress" | "completed";

export const PROGRESS_STATUS_LABEL: Record<ProgressStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

export interface ProgressSummary {
  status: ProgressStatus;
  description: string;
}

export function getIntakeSummary(completeSections: number, totalSections: number): ProgressSummary {
  const status: ProgressStatus =
    completeSections === 0
      ? "not_started"
      : completeSections >= totalSections
        ? "completed"
        : "in_progress";
  return { status, description: `${completeSections} of ${totalSections} sections completed` };
}

export function getChecklistSummary(items: ChecklistItem[]): ProgressSummary {
  const count = (...statuses: ChecklistItem["status"][]) =>
    items.filter((item) => statuses.includes(item.status)).length;

  const approved = count("approved");
  if (items.length > 0 && approved === items.length) {
    return { status: "completed", description: `All ${approved} documents approved` };
  }

  const required = count("required");
  const parts = [
    [count("changes_required"), "needs changes"],
    [required, "required"],
    [count("submitted", "under_review"), "awaiting review"],
  ]
    .filter(([n]) => (n as number) > 0)
    .map(([n, label]) => `${n} ${label}`);

  return {
    status: required === items.length ? "not_started" : "in_progress",
    description: parts.join(" · "),
  };
}
