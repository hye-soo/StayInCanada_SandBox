"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/firebase/session.ts";
import { updateClientQuestionnaireSection } from "@/lib/client-questionnaire.ts";
import type { EducationAssessmentSection } from "@/lib/types.ts";

function textValue(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function saveEducationAssessment(formData: FormData) {
  const { uid } = await requireRole(["client"]);

  const hasECA = formData.get("hasECA");
  const data: EducationAssessmentSection = {
    hasECA: hasECA === "yes" || hasECA === "no" ? hasECA : undefined,
    assessmentCompletionDate: textValue(formData, "assessmentCompletionDate"),
    ecaIdNumber: textValue(formData, "ecaIdNumber"),
  };
  updateClientQuestionnaireSection(uid, "educationAssessment", data);

  revalidatePath("/questionnaire");
  revalidatePath("/questionnaire/education-assessment");
  redirect("/questionnaire");
}
