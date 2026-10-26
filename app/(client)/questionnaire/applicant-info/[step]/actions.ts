"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientQuestionnaire, updateClientQuestionnaireSection } from "@/lib/client-questionnaire.ts";
import { APPLICANT_INFO_STEPS } from "@/lib/questionnaire-fields.ts";

export async function saveApplicantInfoStep(stepId: string, formData: FormData) {
  const { uid } = await requireRole(["client"]);

  const stepIndex = APPLICANT_INFO_STEPS.findIndex((step) => step.id === stepId);
  if (stepIndex === -1) throw new Error(`Unknown applicant-info step: ${stepId}`);
  const step = APPLICANT_INFO_STEPS[stepIndex];

  // Merge this step's fields into the existing section — other
  // steps' fields must survive, this isn't a full-section replace.
  const { applicantInfo } = getClientQuestionnaire(uid);
  const updated = { ...applicantInfo };
  for (const field of step.fields) {
    const value = formData.get(field.name);
    updated[field.name] = typeof value === "string" ? value : "";
  }
  updateClientQuestionnaireSection(uid, "applicantInfo", updated);

  revalidatePath("/questionnaire");
  revalidatePath(`/questionnaire/applicant-info/${stepId}`);

  const isLastStep = stepIndex === APPLICANT_INFO_STEPS.length - 1;
  redirect(
    isLastStep ? "/questionnaire" : `/questionnaire/applicant-info/${APPLICANT_INFO_STEPS[stepIndex + 1].id}`
  );
}
