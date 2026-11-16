import { Check } from "lucide-react";
import { cn } from "cn";

const STEPS = [
  { title: "Fill out the form", done: "All sections filled out", todo: "Answer every section" },
  { title: "Review your answers", done: "Answers checked", todo: "Check and confirm your information" },
  { title: "Submit the form", done: "Sent to your case team", todo: "Send to your case team" },
] as const;

// Figma C10 "Fill out / Review / Submit" stepper. `current` is 1-based;
// earlier steps show a lime check and a lime connector.
export function SubmitSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="flex max-w-[940px] flex-col gap-4 sm:flex-row sm:items-center sm:gap-0">
      {STEPS.map((step, index) => {
        const number = index + 1;
        const done = number < current;
        const active = number === current;
        return (
          <li key={step.title} className={cn("flex items-center gap-3", index < STEPS.length - 1 && "sm:flex-1")}>
            <span
              className={cn(
                "flex size-[42px] shrink-0 items-center justify-center rounded-full text-base font-medium text-primary",
                done ? "bg-lime-soft" : active ? "border border-lime bg-card" : "border border-track bg-card"
              )}
            >
              {done ? <Check className="size-4" strokeWidth={3} aria-label="Done" /> : number}
            </span>
            <span className="flex flex-col whitespace-nowrap">
              <span className="text-[17px] font-semibold text-foreground" aria-current={active ? "step" : undefined}>
                {step.title}
              </span>
              <span className="text-[13px] text-muted-foreground">{done ? step.done : step.todo}</span>
            </span>
            {index < STEPS.length - 1 ? (
              <span aria-hidden className={cn("mx-3 hidden h-[3px] flex-1 rounded-sm sm:block", done ? "bg-lime" : "bg-track")} />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
