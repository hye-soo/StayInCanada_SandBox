import { notFound } from "next/navigation";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientIntake, getClientQuestionnaireLastSavedAt } from "@/lib/client-questionnaire.ts";
import { formatSavedLabel } from "@/lib/format-time.ts";
import { INTAKE_CATEGORIES, INTAKE_STEPS } from "@/lib/data/intake-steps.ts";
import { getIntakeProgress } from "@/lib/intake.ts";
import { PageHeader } from "@/components/layouts/page-header";
import { IntakeNav } from "@/components/patterns/intake-nav";
import { IntakeStepForm } from "@/components/patterns/intake-step-form";
import { ProgressBar } from "@/components/patterns/progress-bar";
import { saveIntakeStep } from "./actions.ts";
import { BackLink } from "@/components/ui/back-link";

// Figma "CIF Complete • 01–32": every intake step, one data-driven page.
export default async function IntakeStepPage({ params }: PageProps<"/questionnaire/[step]">) {
  const { uid } = await requireRole(["client"]);
  const { step: stepId } = await params;
  const index = INTAKE_STEPS.findIndex((step) => step.id === stepId);
  const step = INTAKE_STEPS[index];
  if (!step) notFound();

  const answers = getClientIntake(uid);
  const progress = getIntakeProgress(answers);
  const category = INTAKE_CATEGORIES.find((c) => c.id === step.category)!;

  return (
    <main className="flex flex-col gap-8 pt-2 lg:pt-6">
      <div className="flex flex-col gap-2">
        <BackLink href="/questionnaire">My Intake</BackLink>
        <PageHeader
          title="Your client intake"
          subtitle={`Step ${index + 1} of ${INTAKE_STEPS.length} • ${category.label} • ${formatSavedLabel(getClientQuestionnaireLastSavedAt(uid))}`}
        />
      </div>
      <ProgressBar label={`${progress.doneSteps} of ${progress.totalSteps} steps`} percent={progress.percent} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[321px_minmax(0,1fr)]">
        <IntakeNav answers={answers} currentStepId={step.id} />
        {/* key resets the form's local state (gate, entry count) per step */}
        <IntakeStepForm
          key={step.id}
          step={step}
          answer={answers[step.id]}
          action={saveIntakeStep.bind(null, step.id)}
          isFirst={index === 0}
        />
      </div>
    </main>
  );
}
