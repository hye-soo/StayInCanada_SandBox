import { cn } from "cn";
import type { ReviewRow } from "@/lib/intake.ts";

interface ReviewAnswerRowsProps {
  groups: { stepId: string; title: string; rows: ReviewRow[] }[];
  // "card" = the review screen's section card, "page" = the PDF preview.
  size?: "card" | "page";
}

// Figma "Review / Answer row": question on the left, answer on the right,
// with a small step heading when a section has more than one step.
export function ReviewAnswerRows({ groups, size = "card" }: ReviewAnswerRowsProps) {
  const page = size === "page";
  return (
    <>
      {groups.map((group) => (
        <div key={group.stepId}>
          {groups.length > 1 ? (
            <dt className={cn("font-semibold tracking-wide text-muted-foreground uppercase", page ? "pt-4 pb-1 text-[11px]" : "pt-5 pb-1 text-xs")}>
              {group.title}
            </dt>
          ) : null}
          {group.rows.map((row, index) => (
            <div
              key={index}
              className={cn("flex items-center gap-6 border-b border-border", page ? "min-h-[38px] py-2" : "min-h-[58px] py-3")}
            >
              <dt className={cn("shrink-0 text-muted-foreground", page ? "w-[45%] text-sm" : "w-[330px] text-base")}>{row.label}</dt>
              <dd
                className={cn(
                  "font-medium",
                  page ? "text-sm" : "text-base",
                  row.value.startsWith("Not provided") ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
