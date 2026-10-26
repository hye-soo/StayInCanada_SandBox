"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientQuestionnaire, updateClientQuestionnaireSection } from "@/lib/client-questionnaire.ts";
import { SIBLING_ENTRY_FIELDS } from "@/lib/questionnaire-fields.ts";
import type { SiblingEntry } from "@/lib/types.ts";

function refresh() {
  revalidatePath("/questionnaire");
  revalidatePath("/questionnaire/siblings");
}

export async function updateSiblingEntry(index: number, formData: FormData) {
  const { uid } = await requireRole(["client"]);

  const entry: SiblingEntry = {};
  for (const field of SIBLING_ENTRY_FIELDS) {
    const value = formData.get(field.name as string);
    entry[field.name] = typeof value === "string" ? value : "";
  }

  const { siblings } = getClientQuestionnaire(uid);
  if (index < 0 || index >= siblings.length) throw new Error("Sibling entry not found.");

  const updated = [...siblings];
  updated[index] = entry;
  updateClientQuestionnaireSection(uid, "siblings", updated);

  refresh();
  redirect("/questionnaire/siblings");
}

export async function removeSiblingEntry(index: number) {
  const { uid } = await requireRole(["client"]);

  const { siblings } = getClientQuestionnaire(uid);
  updateClientQuestionnaireSection(
    uid,
    "siblings",
    siblings.filter((_, i) => i !== index)
  );

  refresh();
  redirect("/questionnaire/siblings");
}
