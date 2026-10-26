"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientQuestionnaire, updateClientQuestionnaireSection } from "@/lib/client-questionnaire.ts";
import { SIBLING_ENTRY_FIELDS } from "@/lib/questionnaire-fields.ts";
import type { SiblingEntry } from "@/lib/types.ts";

export async function addSiblingEntry(formData: FormData) {
  const { uid } = await requireRole(["client"]);

  const entry: SiblingEntry = {};
  for (const field of SIBLING_ENTRY_FIELDS) {
    const value = formData.get(field.name as string);
    entry[field.name] = typeof value === "string" ? value : "";
  }

  const { siblings } = getClientQuestionnaire(uid);
  updateClientQuestionnaireSection(uid, "siblings", [...siblings, entry]);

  revalidatePath("/questionnaire");
  revalidatePath("/questionnaire/siblings");
  redirect("/questionnaire/siblings");
}
