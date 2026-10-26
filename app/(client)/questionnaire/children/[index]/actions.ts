"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientQuestionnaire, updateClientQuestionnaireSection } from "@/lib/client-questionnaire.ts";
import { CHILD_ENTRY_FIELDS } from "@/lib/questionnaire-fields.ts";
import type { ChildEntry } from "@/lib/types.ts";

function refresh() {
  revalidatePath("/questionnaire");
  revalidatePath("/questionnaire/children");
}

export async function updateChildEntry(index: number, formData: FormData) {
  const { uid } = await requireRole(["client"]);

  const entry: ChildEntry = {};
  for (const field of CHILD_ENTRY_FIELDS) {
    const value = formData.get(field.name as string);
    entry[field.name] = typeof value === "string" ? value : "";
  }

  const { children } = getClientQuestionnaire(uid);
  if (index < 0 || index >= children.length) throw new Error("Child entry not found.");

  const updated = [...children];
  updated[index] = entry;
  updateClientQuestionnaireSection(uid, "children", updated);

  refresh();
  redirect("/questionnaire/children");
}

export async function removeChildEntry(index: number) {
  const { uid } = await requireRole(["client"]);

  const { children } = getClientQuestionnaire(uid);
  updateClientQuestionnaireSection(
    uid,
    "children",
    children.filter((_, i) => i !== index)
  );

  refresh();
  redirect("/questionnaire/children");
}
