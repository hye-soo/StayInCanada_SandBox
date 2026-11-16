import Link from "next/link";
import { requireRole } from "@/lib/firebase/session.ts";
import {
  getClientIntake,
  getClientQuestionnaireLastSavedAt,
  getClientReviewStartedAt,
  getClientQuestionnaireSubmittedAt,
} from "@/lib/client-questionnaire.ts";
import { getClientChecklist, VISA_TYPE_LABEL } from "@/lib/client-checklist.ts";
import { getClientProfileStore } from "@/lib/client-profile-store.ts";
import { INTAKE_CATEGORIES } from "@/lib/data/intake-steps.ts";
import { formatSavedLabel } from "@/lib/format-time.ts";
import {
  getCategorySteps,
  getCategoryStatus,
  getIntakeProgress,
  getNextIncompleteStep,
  getStep,
  getStepStatus,
  INTAKE_STATUS_LABEL,
} from "@/lib/intake.ts";
import { IntakeReady } from "@/components/patterns/intake-ready";
import { IntakeSubmitted } from "@/components/patterns/intake-submitted";
import { getIntakeReviewStore } from "@/lib/intake-review-store.ts";
import { requestIntakeCorrection } from "./actions.ts";
import { SectionResumeRow } from "@/components/patterns/section-resume-row";
import { Icon } from "@/components/ui/icon";

// Figma "CIF Complete • Start your intake" / "Continue your intake",
// and C11 once every section is filled out but not yet submitted.
export default async function IntakeStartPage({
  searchParams,
}: PageProps<"/questionnaire">) {
  const { uid, displayName, email } = await requireRole(["client"]);
  const { saved, correction } = await searchParams;
  const answers = getClientIntake(uid);
  const progress = getIntakeProgress(answers);
  const next = getNextIncompleteStep(answers);
  const submittedAt = getClientQuestionnaireSubmittedAt(uid);
  const savedAt = getClientQuestionnaireLastSavedAt(uid);
  const { visaType } = getClientChecklist(uid);
  const firstName =
    displayName?.split(" ")[0] ?? email?.split("@")[0] ?? "there";
  const started = Object.keys(answers).length > 0;
  const nextCategory = INTAKE_CATEGORIES.find(
    (category) => category.id === next?.category,
  );
  const completed = INTAKE_CATEGORIES.filter(
    (category) => getCategoryStatus(category.id, answers) === "complete",
  );

  // Sent: Figma "Intake awaiting review".
  if (submittedAt) {
    return (
      <IntakeSubmitted
        visaLabel={VISA_TYPE_LABEL[visaType]}
        applicationId={getClientProfileStore().getProfile(uid).applicationId}
        submittedAt={submittedAt}
        underReview={getIntakeReviewStore().getReviewed(uid).size > 0}
        correctionSent={correction === "sent"}
        requestCorrection={requestIntakeCorrection}
      />
    );
  }

  // Everything filled out but not sent yet: C10 "Start review" until the
  // client has opened the review, then C11 "Continue your review".
  if (started && !next && !submittedAt) {
    return (
      <IntakeReady
        variant={getClientReviewStartedAt(uid) ? "return" : "done"}
        answers={answers}
        visaLabel={VISA_TYPE_LABEL[visaType]}
        applicationId={getClientProfileStore().getProfile(uid).applicationId}
      />
    );
  }

  // Right after "Save & exit" (Figma "Saved draft / Continue where you
  // left off"): back to the exact step the client left.
  const savedStep =
    typeof saved === "string" && started && next ? getStep(saved) : undefined;

  const hero = savedStep
    ? {
        eyebrow: "Continue where you left off",
        title: "Continue your intake",
        body: "Continue to return to the exact form you left. Your intake has not been submitted.",
        href: `/questionnaire/${savedStep.id}`,
        action: "Continue my intake",
      }
    : !started
      ? {
          eyebrow: "Your client intake",
          title: "Your next step starts here",
          body: "Tell us about yourself, one section at a time. Save your progress and come back whenever you're ready.",
          href: `/questionnaire/${next?.id ?? ""}`,
          action: "Start my intake",
        }
      : next && nextCategory
        ? {
            eyebrow: "Continue where you left off",
            title: `Let's finish your ${nextCategory.label.toLowerCase()} details.`,
            body:
              completed.length > 0
                ? `Your ${completed.map((category) => category.label).join(", ")} ${completed.length === 1 ? "section is" : "sections are"} complete. Next, ${nextCategory.label.toLowerCase()}.`
                : "Your answers so far are saved. Pick up with the next question.",
            href: `/questionnaire/${next.id}`,
            action: "Continue my intake",
          }
        : {
            eyebrow: submittedAt ? "Submitted" : "All sections complete",
            title: submittedAt
              ? "Your intake is with your case team."
              : "Ready to review and submit.",
            body: submittedAt
              ? "You can still look over your answers at any time."
              : "Check your answers once more, then confirm the declaration to send them to your case team.",
            href: "/questionnaire/review",
            action: submittedAt
              ? "View my submitted intake"
              : "Review and submit",
          };

  return (
    <main className="flex flex-col gap-6 pt-2 lg:pt-2">
      <header className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">
          My Intake · {VISA_TYPE_LABEL[visaType]}
        </p>
        <h1 className="text-[32px] font-bold leading-10 text-foreground">
          {savedStep
            ? "Your progress is saved"
            : started
              ? `Welcome back, ${firstName}`
              : `Welcome, ${firstName}`}
        </h1>
        <p className="text-base text-muted-foreground">
          {savedStep
            ? "Your intake is still a draft. Continue whenever you're ready."
            : started
              ? "Your saved answers are ready when you are."
              : "Complete your intake at your own pace. We'll guide you through each section."}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,648fr)_minmax(0,434fr)]">
        <section className="flex min-h-[300px] flex-col items-start gap-4 rounded-[14px] bg-linear-to-r from-navy via-ocean via-65% to-azure p-7 text-white">
          <p className="text-xs uppercase">{hero.eyebrow}</p>
          <h2 className="mt-2 text-[32px] font-bold leading-10">
            {hero.title}
          </h2>
          <p className="max-w-[592px] text-base">{hero.body}</p>
          <Link
            href={hero.href}
            className="mt-auto inline-flex h-10 items-center justify-center gap-1.5 rounded-[30px] bg-primary px-6 text-sm font-semibold text-white hover:bg-primary/90"
          >
            {hero.action}
            <Icon src="/icons/arrow-up-right.svg" className="size-3.5" />
          </Link>
        </section>

        {savedStep ? (
          <section className="flex flex-col gap-4 rounded-[14px] border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground">
              Saved draft
            </h2>
            <p className="text-base font-semibold text-foreground">
              Your latest answers have been saved.
            </p>
            <p className="text-sm text-muted-foreground">
              Your case team will receive your intake after you review your
              answers and submit.
            </p>
          </section>
        ) : (
          <section className="flex flex-col gap-4 rounded-[14px] border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground">
              Your intake progress
            </h2>
            <div className="flex justify-between text-base text-muted-foreground">
              <span>
                {progress.completeCategories} of {progress.totalCategories}{" "}
                sections complete
              </span>
              <span>
                {Math.round(
                  (progress.completeCategories / progress.totalCategories) *
                    100,
                )}
                %
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded bg-secondary">
              <div
                className="h-full rounded bg-primary"
                style={{
                  width: `${(progress.completeCategories / progress.totalCategories) * 100}%`,
                }}
              />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {savedAt
                ? formatSavedLabel(savedAt).replace("Saved", "Last saved")
                : "Nothing saved yet"}
            </p>
            <hr className="border-border" />
            <p className="text-base text-muted-foreground">
              You&apos;ll have a chance to review everything before submitting.
            </p>
          </section>
        )}
      </div>

      <section className="flex flex-col gap-3.5 rounded-[14px] border border-border bg-card px-6 py-5">
        <div className="grid grid-cols-1 items-baseline gap-x-6 md:grid-cols-2">
          <h2 className="text-xl font-semibold text-foreground">
            Your sections
          </h2>
          <p className="text-sm text-muted-foreground">
            Open any section to continue or edit
          </p>
        </div>
        <div className="grid grid-flow-row grid-cols-1 gap-x-6 md:grid-flow-col md:grid-cols-2 md:grid-rows-4">
          {INTAKE_CATEGORIES.map((category, index) => {
            const status = getCategoryStatus(category.id, answers);
            const steps = getCategorySteps(category.id);
            const resume =
              steps.find(
                (step) => getStepStatus(step, answers[step.id]) !== "complete",
              ) ?? steps[0]!;
            const isNext = category.id === nextCategory?.id && started;
            return (
              <SectionResumeRow
                key={category.id}
                href={`/questionnaire/${resume.id}`}
                number={index + 1}
                title={category.label}
                complete={status === "complete"}
                status={
                  isNext
                    ? `${INTAKE_STATUS_LABEL[status]} · Continue here`
                    : INTAKE_STATUS_LABEL[status]
                }
              />
            );
          })}
        </div>
      </section>
    </main>
  );
}
