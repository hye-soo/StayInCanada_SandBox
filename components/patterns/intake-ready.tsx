import Link from "next/link";
import { ArrowRight, Check, ChevronRight, Info } from "lucide-react";
import { INTAKE_CATEGORIES } from "@/lib/data/intake-steps.ts";
import { getCategoryProgress, type IntakeAnswers } from "@/lib/intake.ts";
import { SubmitSteps } from "@/components/patterns/submit-steps";

// Copy for the two "everything filled out, not submitted" screens:
//   done    C10, right after the last question
//   return  C11, any later visit to My Intake
const COPY = {
  done: {
    title: "All sections filled out",
    cardTitle: "You're ready to review!",
    cardBody:
      "All sections have been filled out. Check your answers carefully and make any corrections before sending your intake to your case team.",
    action: "Start review",
    noteTitle: "You can still make changes during the review.",
    noteBody: "If you find any mistakes, you can return to the relevant section and edit your answers before submitting.",
  },
  return: {
    title: "Continue your review",
    cardTitle: "Welcome back! Continue your review",
    cardBody:
      "You've filled out all sections of your intake form. Pick up where you left off to check your answers before submitting.",
    action: "Resume review",
    noteTitle: "Your form has not been submitted yet.",
    noteBody: "You can still make changes during review. Submit your intake after you've confirmed everything is correct.",
  },
} as const;

interface IntakeReadyProps {
  variant: keyof typeof COPY;
  answers: IntakeAnswers;
  visaLabel: string;
  applicationId: string;
}

export function IntakeReady({ variant, answers, visaLabel, applicationId }: IntakeReadyProps) {
  const copy = COPY[variant];
  return (
    <main className="flex flex-col gap-6 pt-2">
      <header className="flex flex-col gap-2">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          My Intake <ChevronRight className="size-3.5" aria-hidden /> {visaLabel}
        </p>
        <h1 className="text-[34px] font-semibold text-foreground">{copy.title}</h1>
        <p className="text-base text-foreground">
          {variant === "done"
            ? "You've finished answering the questions in your intake form. Next, review your answers before submitting."
            : `${visaLabel} \u2022 Application ${applicationId} \u2022 Review in progress`}
        </p>
      </header>

      <SubmitSteps current={2} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[416fr_668fr]">
        <section className="flex flex-col gap-2 rounded-2xl border border-track bg-card p-7">
          <h2 className="text-[23px] font-semibold text-foreground">Completion summary</h2>
          <p className="text-[15px] text-muted-foreground">All {INTAKE_CATEGORIES.length} sections have been filled out.</p>
          <ul className="mt-3 flex flex-col">
            {INTAKE_CATEGORIES.map((category) => {
              const { done, total } = getCategoryProgress(category.id, answers);
              return (
                <li key={category.id} className="flex items-center gap-3 py-1.5">
                  <span className="flex size-[29px] shrink-0 items-center justify-center rounded-full bg-lime-soft text-primary">
                    <Check className="size-4" strokeWidth={3} aria-hidden />
                  </span>
                  <span className="flex flex-1 items-center justify-between border-b border-track py-1 text-[15px] font-semibold text-foreground">
                    {category.label}
                    <span className="text-sm font-normal text-muted-foreground">
                      {done} / {total}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="flex flex-col gap-6 rounded-2xl border border-track bg-card p-6">
          <div aria-hidden className="flex h-[175px] items-center justify-center rounded-[15px] bg-secondary">
            <div className="relative flex h-[119px] w-24 flex-col justify-center gap-4 rounded-[10px] border border-navy bg-card px-5">
              <span className="absolute top-0 right-0 size-5 rounded-tr-[10px] bg-sky-tint" />
              {[0, 1, 2].map((row) => (
                <span key={row} className="flex items-center gap-2">
                  <Check className="size-4 text-primary" strokeWidth={3} />
                  <span className="h-[3px] w-8 rounded-sm bg-icon-muted" />
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 px-5">
            <h2 className="text-3xl font-semibold text-foreground">{copy.cardTitle}</h2>
            <p className="text-[17px] text-foreground">
              {copy.cardBody}
            </p>
          </div>
          <Link
            href="/questionnaire/review"
            prefetch={false}
            className="mx-auto mt-4 flex h-[58px] w-full max-w-[364px] items-center justify-center gap-3 rounded-full bg-primary text-xl font-semibold text-white hover:bg-primary/90"
          >
            {copy.action}
            <ArrowRight className="size-5" aria-hidden />
          </Link>
        </section>
      </div>

      <aside className="flex gap-3 rounded-[14px] bg-secondary px-6 py-5">
        <Info className="mt-0.5 size-6 shrink-0 text-muted-foreground" aria-hidden />
        <div className="flex flex-col gap-1">
          <p className="text-lg font-semibold text-foreground">{copy.noteTitle}</p>
          <p className="text-[15px] text-muted-foreground">
            {copy.noteBody}
          </p>
        </div>
      </aside>
    </main>
  );
}
