"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientQuestionnaire, updateClientQuestionnaireSection } from "@/lib/client-questionnaire.ts";
import { EDUCATION_HISTORY_ENTRY_FIELDS } from "@/lib/questionnaire-fields.ts";
import type { EducationHistoryEntry } from "@/lib/types.ts";

function refresh() {
  revalidatePath("/questionnaire");
  revalidatePath("/questionnaire/education-history");
}

export async function updateEducationHistoryEntry(index: number, formData: FormData) {
  const { uid } = await requireRole(["client"]);

  const entry: EducationHistoryEntry = {};
  for (const field of EDUCATION_HISTORY_ENTRY_FIELDS) {
    const value = formData.get(field.name as string);
    entry[field.name] = typeof value === "string" ? value : "";
  }

  const { educationHistory } = getClientQuestionnaire(uid);
  if (index < 0 || index >= educationHistory.length) {
    throw new Error("Education history entry not found.");
  }

  const updated = [...educationHistory];
  updated[index] = entry;
  updateClientQuestionnaireSection(uid, "educationHistory", updated);

  refresh();
  redirect("/questionnaire/education-history");
}

export async function removeEducationHistoryEntry(index: number) {
  const { uid } = await requireRole(["client"]);

  const { educationHistory } = getClientQuestionnaire(uid);
  updateClientQuestionnaireSection(
    uid,
    "educationHistory",
    educationHistory.filter((_, i) => i !== index)
  );

  refresh();
  redirect("/questionnaire/education-history");
}
