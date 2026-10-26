"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientQuestionnaire, updateClientQuestionnaireSection } from "@/lib/client-questionnaire.ts";
import { TRAVEL_HISTORY_ENTRY_FIELDS } from "@/lib/questionnaire-fields.ts";
import type { TravelHistoryEntry } from "@/lib/types.ts";

export async function addTravelHistoryEntry(formData: FormData) {
  const { uid } = await requireRole(["client"]);

  const entry: TravelHistoryEntry = {};
  for (const field of TRAVEL_HISTORY_ENTRY_FIELDS) {
    const value = formData.get(field.name as string);
    entry[field.name] = typeof value === "string" ? value : "";
  }

  // Preserve the hasTravelled flag — this section is a flag + array,
  // not a plain array, so the whole object gets written back.
  const { travelHistory } = getClientQuestionnaire(uid);
  updateClientQuestionnaireSection(uid, "travelHistory", {
    hasTravelled: travelHistory.hasTravelled,
    entries: [...travelHistory.entries, entry],
  });

  revalidatePath("/questionnaire");
  revalidatePath("/questionnaire/travel-history");
  redirect("/questionnaire/travel-history");
}
