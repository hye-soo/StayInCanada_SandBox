"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/firebase/session.ts";
import {
  getClientIntake,
  getClientQuestionnaireSubmittedAt,
  saveClientIntakeStep,
  submitClientQuestionnaire,
} from "@/lib/client-questionnaire.ts";
import { INTAKE_CATEGORIES } from "@/lib/data/intake-steps.ts";
import { getCategorySteps, getNextIncompleteStep, parseStepForm, pickStepForm } from "@/lib/intake.ts";
import { getActivityLogStore } from "@/lib/activity-log-store.ts";
import { getNotificationStore } from "@/lib/notification-store.ts";

// C03: submit only a complete intake with the declaration confirmed;
// Admin is told it's ready for review.
export async function submitIntake(formData: FormData) {
  const { uid, displayName } = await requireRole(["client"]);
  if (getNextIncompleteStep(getClientIntake(uid))) {
    redirect(`/questionnaire/review?error=${encodeURIComponent("Finish every section before submitting.")}`);
  }
  if (formData.get("declaration") !== "on") {
    redirect(`/questionnaire/review?error=${encodeURIComponent("Confirm the declaration to submit.")}`);
  }

  submitClientQuestionnaire(uid);
  getActivityLogStore().append(uid, "Intake submitted for review");
  getNotificationStore().create("admin", `${displayName ?? "A client"} submitted their intake`, `/admin/${uid}/intake`);

  revalidatePath("/questionnaire", "layout");
  revalidatePath("/dashboard");
  redirect("/questionnaire/review?submitted=1");
}

// "Edit <section>" dialog: saves every step of one section at once (each
// input prefixed "<stepId>__").
export async function saveReviewSection(formData: FormData) {
  const { uid } = await requireRole(["client"]);
  const category = INTAKE_CATEGORIES.find((item) => item.id === formData.get("section"));
  if (!category || getClientQuestionnaireSubmittedAt(uid)) redirect("/questionnaire/review");

  for (const step of getCategorySteps(category.id)) {
    saveClientIntakeStep(uid, step.id, parseStepForm(step, pickStepForm(formData, `${step.id}__`)));
  }
  // No redirect: refreshing the data re-renders the review behind the
  // dialog, and the dialog closes itself once this resolves.
  revalidatePath("/questionnaire", "layout");
  revalidatePath("/dashboard");
}
