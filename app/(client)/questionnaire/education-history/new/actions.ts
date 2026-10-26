"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientQuestionnaire, updateClientQuestionnaireSection } from "@/lib/client-questionnaire.ts";
import { EDUCATION_HISTORY_ENTRY_FIELDS } from "@/lib/questionnaire-fields.ts";
import type { EducationHistoryEntry } from "@/lib/types.ts";

export async function addEducationHistoryEntry(formData: FormData) {
  const { uid } = await requireRole(["client"]);

  const entry: EducationHistoryEntry = {};
  for (const field of EDUCATION_HISTORY_ENTRY_FIELDS) {
    const value = formData.get(field.name as string);
    entry[field.name] = typeof value === "string" ? value : "";
  }

  const { educationHistory } = getClientQuestionnaire(uid);
  updateClientQuestionnaireSection(uid, "educationHistory", [...educationHistory, entry]);

  revalidatePath("/questionnaire");
  revalidatePath("/questionnaire/education-history");
  redirect("/questionnaire/education-history");
}
