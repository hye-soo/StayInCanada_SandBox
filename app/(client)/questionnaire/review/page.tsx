import Link from "next/link";
import { cn } from "cn";
import { requireRole } from "@/lib/firebase/session.ts";
import {
  getClientIntake,
  getClientQuestionnaireSubmittedAt,
  markClientReviewStarted,
} from "@/lib/client-questionnaire.ts";
import { getClientChecklist, VISA_TYPE_LABEL } from "@/lib/client-checklist.ts";
import { getClientProfileStore } from "@/lib/client-profile-store.ts";
import {
  INTAKE_CATEGORIES,
  type IntakeCategoryId,
} from "@/lib/data/intake-steps.ts";
import {
  getCategoryReview,
  getCategorySteps,
  getIntakeProgress,
  getNextIncompleteStep,
} from "@/lib/intake.ts";
import { PrintButton } from "@/components/patterns/print-button";
import { ReviewAnswerRows } from "@/components/patterns/review-answer-rows";
import { ReviewEditDialog } from "@/components/patterns/review-edit-dialog";
import { SubmissionSuccessDialog } from "@/components/patterns/submission-success-dialog";
import { SubmitReviewForm } from "@/components/patterns/submit-review-form";
import { saveReviewSection, submitIntake } from "./actions.ts";
import { BackLink } from "@/components/ui/back-link";

const SECTION_DESCRIPTION: Record<IntakeCategoryId, string> = {
  personal: "Identity, contact, citizenship & passport",
  family: "Relationships, parents, children & siblings",
  address: "Current and previous addresses",
  education: "Schooling, credential assessment & language tests",
  employment: "Current and previous employment",
  travel: "Trips outside your countries of citizenship or residence",
  immigration: "Past applications, refusals & removals",
  background: "Criminal, security & medical questions",
};

// Figma "Review & submission • Review answers / <section>": one section's
// answers at a time, then confirm and send. Read-only once submitted.
export default async function IntakeReviewPage({
  searchParams,
}: PageProps<"/questionnaire/review">) {
  const { uid, displayName, email } = await requireRole(["client"]);
  const { error, section, submitted } = await searchParams;
  const answers = getClientIntake(uid);
  const progress = getIntakeProgress(answers);
  const next = getNextIncompleteStep(answers);
  const submittedAt = getClientQuestionnaireSubmittedAt(uid);
  // Marked while rendering (the Start/Resume review links don't prefetch,
  // so only a real visit counts).
  if (!next && !submittedAt) markClientReviewStarted(uid);

  const pdf = section === "pdf";
  const active =
    INTAKE_CATEGORIES.find((category) => category.id === section) ??
    INTAKE_CATEGORIES[0]!;
  const groups = getCategoryReview(active.id, answers);
  const { visaType } = getClientChecklist(uid);
  const { applicationId } = getClientProfileStore().getProfile(uid);
  const identity = answers["legal-identity"]?.values;
  const clientName =
    [identity?.firstName, identity?.lastName].filter(Boolean).join(" ") ||
    displayName ||
    "Client";
  const fileName = `${clientName.replace(/\s+/g, "-")}-Intake.pdf`;
  const copyLabel = submittedAt ? "Submitted copy" : "Draft copy";

  return (
    <main className="flex flex-col gap-5 pt-2">
      <header className="flex flex-col gap-1.5 print:hidden">
        <BackLink href="/questionnaire">My Intake</BackLink>
        <h1 className="text-[32px] font-bold leading-10 text-foreground">
          {pdf ? "Review your full intake" : "Check your answers"}
        </h1>
        <p className="text-base text-foreground">
          {pdf
            ? "View all your answers in one document. Use the sections to make corrections."
            : submittedAt
              ? "This is what you sent to your case team. They'll contact you if anything needs clarification."
              : "Review each section and correct anything before sending your intake to your case team."}
        </p>
        <p className="text-xs text-muted-foreground">
          {pdf ? (
            `${copyLabel} · ${INTAKE_CATEGORIES.length} pages · ${applicationId}`
          ) : (
            <>
              {progress.completeCategories} of {progress.totalCategories}{" "}
              sections complete · {VISA_TYPE_LABEL[visaType]} · {applicationId}
              {submittedAt
                ? ` · Submitted ${new Date(submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : ""}
            </>
          )}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[212px_minmax(0,1fr)]">
        <nav
          aria-label="Review sections"
          className="flex flex-wrap gap-1 lg:flex-col print:hidden"
        >
          {[...INTAKE_CATEGORIES, { id: "pdf", label: "Review PDF" }].map(
            (category) => {
              const current = pdf
                ? category.id === "pdf"
                : category.id === active.id;
              return (
                <Link
                  key={category.id}
                  href={`/questionnaire/review?section=${category.id}`}
                  scroll={false}
                  aria-current={current ? "page" : undefined}
                  className="flex h-12 items-center rounded-lg px-4 text-base text-foreground hover:bg-secondary"
                >
                  <span
                    className={cn(
                      current
                        ? "border-b-2 border-primary pb-1 font-semibold"
                        : "font-medium",
                    )}
                  >
                    {category.label}
                  </span>
                </Link>
              );
            },
          )}
        </nav>

        {pdf ? (
          <section className="flex flex-col overflow-hidden rounded-xl border border-border bg-card print:border-0">
            <div className="flex items-center justify-between gap-4 px-5 py-3 print:hidden">
              <p className="text-base font-medium text-foreground">
                {fileName} · {INTAKE_CATEGORIES.length} pages
              </p>
              <PrintButton label="Download PDF" />
            </div>
            <div className="flex max-h-[520px] flex-col gap-6 overflow-y-auto bg-secondary px-8 py-5 print:max-h-none print:overflow-visible print:bg-transparent print:p-0">
              {INTAKE_CATEGORIES.map((category) => (
                <article
                  key={category.id}
                  className="flex flex-col gap-1 bg-card px-8 py-9 shadow-card print:break-after-page print:shadow-none"
                >
                  <p className="text-xs text-muted-foreground uppercase">
                    {copyLabel}
                  </p>
                  <h2 className="text-[22px] font-semibold text-foreground">
                    {category.label}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {clientName} · {VISA_TYPE_LABEL[visaType]} · {applicationId}
                  </p>
                  <dl className="mt-4">
                    <ReviewAnswerRows
                      groups={getCategoryReview(category.id, answers)}
                      size="page"
                    />
                  </dl>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex flex-col gap-1 px-6 py-3.5">
              <h2 className="text-xl font-semibold text-foreground">
                {active.label}
              </h2>
              <p className="text-xs text-muted-foreground">
                {SECTION_DESCRIPTION[active.id]}
              </p>
            </div>
            <dl className="max-h-[460px] overflow-y-auto px-6">
              <ReviewAnswerRows groups={groups} />
            </dl>
            {submittedAt ? (
              <div className="h-6" />
            ) : (
              <ReviewEditDialog
                key={active.id}
                categoryId={active.id}
                label={active.label}
                answers={Object.fromEntries(
                  getCategorySteps(active.id).map((step) => [
                    step.id,
                    answers[step.id],
                  ]),
                )}
                action={saveReviewSection}
              />
            )}
          </section>
        )}
      </div>

      {submittedAt && submitted === "1" ? (
        <SubmissionSuccessDialog
          firstName={
            displayName?.split(" ")[0] ?? email?.split("@")[0] ?? "there"
          }
        />
      ) : null}

      {submittedAt ? null : (
        <div className="print:hidden">
          <SubmitReviewForm
            action={submitIntake}
            error={typeof error === "string" ? error : undefined}
          />
        </div>
      )}
    </main>
  );
}
