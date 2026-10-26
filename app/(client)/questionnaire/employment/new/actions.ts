"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientQuestionnaire, updateClientQuestionnaireSection } from "@/lib/client-questionnaire.ts";
import { EMPLOYMENT_ENTRY_FIELDS } from "@/lib/questionnaire-fields.ts";
import type { EmploymentEntry } from "@/lib/types.ts";

export async function addEmploymentEntry(formData: FormData) {
  const { uid } = await requireRole(["client"]);

  const entry: EmploymentEntry = { toPresent: formData.get("toPresent") === "on" };
  for (const field of EMPLOYMENT_ENTRY_FIELDS) {
    const value = formData.get(field.name as string);
    entry[field.name] = typeof value === "string" ? value : "";
  }

  const { employment } = getClientQuestionnaire(uid);
  updateClientQuestionnaireSection(uid, "employment", [...employment, entry]);

  revalidatePath("/questionnaire");
  revalidatePath("/questionnaire/employment");
  redirect("/questionnaire/employment");
}
