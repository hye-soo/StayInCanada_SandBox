import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientQuestionnaire } from "@/lib/client-questionnaire.ts";
import { APPLICANT_INFO_STEPS } from "@/lib/questionnaire-fields.ts";
import { Button } from "@/components/ui/button";
import { Progress, ProgressLabel, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { saveApplicantInfoStep } from "./actions.ts";

export default async function ApplicantInfoStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { uid } = await requireRole(["client"]);
  const { step: stepId } = await params;

  const stepIndex = APPLICANT_INFO_STEPS.findIndex((step) => step.id === stepId);
  if (stepIndex === -1) notFound();
  const step = APPLICANT_INFO_STEPS[stepIndex];

  const { applicantInfo } = getClientQuestionnaire(uid);
  const answeredCount = step.fields.filter((field) => applicantInfo[field.name]).length;

  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === APPLICANT_INFO_STEPS.length - 1;
  const backHref = isFirstStep
    ? "/questionnaire"
    : `/questionnaire/applicant-info/${APPLICANT_INFO_STEPS[stepIndex - 1].id}`;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <Link href={backHref} className="text-sm text-muted-foreground hover:underline">
        Back
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{step.label}</h1>
        <p className="text-sm text-muted-foreground">
          Step {stepIndex + 1} of {APPLICANT_INFO_STEPS.length} — Applicant Information
        </p>
      </div>

      <Progress value={(answeredCount / step.fields.length) * 100}>
        <ProgressLabel>
          {answeredCount} of {step.fields.length} answered
        </ProgressLabel>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>

      <form action={saveApplicantInfoStep.bind(null, step.id)} className="flex flex-col gap-3">
        {step.fields.map((field) => (
          <label key={field.name} className="flex flex-col gap-1 text-sm">
            {field.label}
            <input
              type="text"
              name={field.name}
              defaultValue={applicantInfo[field.name] ?? ""}
              className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
            />
          </label>
        ))}
        <Button type="submit" className="self-start">
          {isLastStep ? "Save and finish" : "Save and continue"}
        </Button>
      </form>
    </main>
  );
}
