"use server";

import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/firebase/session.ts";
import { saveClientIntakeStep } from "@/lib/client-questionnaire.ts";
import { INTAKE_STEPS } from "@/lib/data/intake-steps.ts";
import { parseStepForm } from "@/lib/intake.ts";

// Saves one intake step as a draft (incomplete answers are fine), then
// goes where the clicked button says: back, onward, or out.
export async function saveIntakeStep(stepId: string, formData: FormData) {
  const { uid } = await requireRole(["client"]);
  const index = INTAKE_STEPS.findIndex((step) => step.id === stepId);
  const step = INTAKE_STEPS[index];
  if (!step) notFound();

  saveClientIntakeStep(uid, step.id, parseStepForm(step, formData));
  revalidatePath("/questionnaire", "layout");
  revalidatePath("/dashboard");

  const intent = formData.get("intent");
  if (intent === "exit") redirect(`/questionnaire?saved=${step.id}`);
  if (intent === "previous") redirect(index > 0 ? `/questionnaire/${INTAKE_STEPS[index - 1]!.id}` : "/questionnaire");
  const next = INTAKE_STEPS[index + 1];
  redirect(next ? `/questionnaire/${next.id}` : "/questionnaire/complete");
}
