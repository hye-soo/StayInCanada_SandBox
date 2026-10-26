"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientQuestionnaire, updateClientQuestionnaireSection } from "@/lib/client-questionnaire.ts";
import { CHILD_ENTRY_FIELDS } from "@/lib/questionnaire-fields.ts";
import type { ChildEntry } from "@/lib/types.ts";

export async function addChildEntry(formData: FormData) {
  const { uid } = await requireRole(["client"]);

  const entry: ChildEntry = {};
  for (const field of CHILD_ENTRY_FIELDS) {
    const value = formData.get(field.name as string);
    entry[field.name] = typeof value === "string" ? value : "";
  }

  const { children } = getClientQuestionnaire(uid);
  updateClientQuestionnaireSection(uid, "children", [...children, entry]);

  revalidatePath("/questionnaire");
  revalidatePath("/questionnaire/children");
  redirect("/questionnaire/children");
}
