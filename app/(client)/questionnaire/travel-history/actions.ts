"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientQuestionnaire, updateClientQuestionnaireSection } from "@/lib/client-questionnaire.ts";

// Top-level yes/no flag, separate from the entries array below it.
export async function saveTravelledFlag(formData: FormData) {
  const { uid } = await requireRole(["client"]);

  const value = formData.get("hasTravelled");
  const { travelHistory } = getClientQuestionnaire(uid);
  updateClientQuestionnaireSection(uid, "travelHistory", {
    ...travelHistory,
    hasTravelled: value === "yes" || value === "no" ? value : undefined,
  });

  revalidatePath("/questionnaire");
  revalidatePath("/questionnaire/travel-history");
}
