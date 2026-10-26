"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientQuestionnaire, updateClientQuestionnaireSection } from "@/lib/client-questionnaire.ts";
import { EMPLOYMENT_ENTRY_FIELDS } from "@/lib/questionnaire-fields.ts";
import type { EmploymentEntry } from "@/lib/types.ts";

function refresh() {
  revalidatePath("/questionnaire");
  revalidatePath("/questionnaire/employment");
}

export async function updateEmploymentEntry(index: number, formData: FormData) {
  const { uid } = await requireRole(["client"]);

  const entry: EmploymentEntry = { toPresent: formData.get("toPresent") === "on" };
  for (const field of EMPLOYMENT_ENTRY_FIELDS) {
    const value = formData.get(field.name as string);
    entry[field.name] = typeof value === "string" ? value : "";
  }

  const { employment } = getClientQuestionnaire(uid);
  if (index < 0 || index >= employment.length) throw new Error("Employment entry not found.");

  const updated = [...employment];
  updated[index] = entry;
  updateClientQuestionnaireSection(uid, "employment", updated);

  refresh();
  redirect("/questionnaire/employment");
}

export async function removeEmploymentEntry(index: number) {
  const { uid } = await requireRole(["client"]);

  const { employment } = getClientQuestionnaire(uid);
  updateClientQuestionnaireSection(
    uid,
    "employment",
    employment.filter((_, i) => i !== index)
  );

  refresh();
  redirect("/questionnaire/employment");
}
