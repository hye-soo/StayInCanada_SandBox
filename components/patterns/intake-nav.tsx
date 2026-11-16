import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "cn";
import { INTAKE_CATEGORIES, INTAKE_STEPS } from "@/lib/data/intake-steps.ts";
import { getCategoryProgress, getCategorySteps, getStepStatus, type IntakeAnswers } from "@/lib/intake.ts";

// Figma "Intake sections" accordion: one row per category with its
// "done / total" count; the current category is open and lists its
// steps (done = lime check, current = highlighted, upcoming = ring).
export function IntakeNav({ answers, currentStepId }: { answers: IntakeAnswers; currentStepId: string }) {
  const currentCategory = INTAKE_STEPS.find((step) => step.id === currentStepId)?.category;

  return (
    <nav aria-label="Intake sections" className="flex flex-col gap-4 rounded-[18px] border border-border bg-card p-4 lg:sticky lg:top-8">
      <div className="px-2 pt-2">
        <h2 className="text-xl font-semibold text-foreground">Intake sections</h2>
        <p className="text-base text-muted-foreground">
          {INTAKE_CATEGORIES.length} sections · {INTAKE_STEPS.length} steps
        </p>
      </div>

      <ul className="flex flex-col">
        {INTAKE_CATEGORIES.map((category) => {
          const { done, total } = getCategoryProgress(category.id, answers);
          const open = category.id === currentCategory;
          return (
            <li key={category.id} className="border-b border-border last:border-b-0">
              <details open={open} className="group">
                <summary
                  className={cn(
                    "flex h-12 cursor-pointer list-none items-center justify-between rounded-[14px] px-3 text-base font-medium text-foreground [&::-webkit-details-marker]:hidden",
                    open && "bg-secondary"
                  )}
                >
                  {category.label}
                  <span className="flex items-center gap-3 text-xs font-normal text-muted-foreground">
                    {done} / {total}
                    <ChevronDown className="size-4 text-foreground transition-transform group-open:rotate-180" />
                  </span>
                </summary>
                <ol className="flex flex-col gap-1 py-2 pl-5">
                  {getCategorySteps(category.id).map((step) => {
                    const complete = getStepStatus(step, answers[step.id]) === "complete";
                    const current = step.id === currentStepId;
                    return (
                      <li key={step.id}>
                        <Link
                          href={`/questionnaire/${step.id}`}
                          aria-current={current ? "step" : undefined}
                          className={cn(
                            "flex h-[38px] items-center gap-3 rounded-[20px] px-2 text-sm text-foreground hover:underline",
                            current && "bg-lime-soft font-medium"
                          )}
                        >
                          {complete ? (
                            <span className="flex size-[25px] shrink-0 items-center justify-center rounded-full bg-lime">
                              <Check className="size-4 text-navy" strokeWidth={3} />
                            </span>
                          ) : (
                            <span
                              className={cn(
                                "size-[25px] shrink-0 rounded-full border-2",
                                current ? "border-primary bg-[radial-gradient(circle,var(--color-primary)_35%,transparent_40%)]" : "border-track"
                              )}
                            />
                          )}
                          {step.title}
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </details>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
