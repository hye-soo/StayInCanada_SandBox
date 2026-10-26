"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientQuestionnaire, updateClientQuestionnaireSection } from "@/lib/client-questionnaire.ts";
import { TRAVEL_HISTORY_ENTRY_FIELDS } from "@/lib/questionnaire-fields.ts";
import type { TravelHistoryEntry } from "@/lib/types.ts";

function refresh() {
  revalidatePath("/questionnaire");
  revalidatePath("/questionnaire/travel-history");
}

export async function updateTravelHistoryEntry(index: number, formData: FormData) {
  const { uid } = await requireRole(["client"]);

  const entry: TravelHistoryEntry = {};
  for (const field of TRAVEL_HISTORY_ENTRY_FIELDS) {
    const value = formData.get(field.name as string);
    entry[field.name] = typeof value === "string" ? value : "";
  }

  const { travelHistory } = getClientQuestionnaire(uid);
  if (index < 0 || index >= travelHistory.entries.length) {
    throw new Error("Travel history entry not found.");
  }

  const updatedEntries = [...travelHistory.entries];
  updatedEntries[index] = entry;
  updateClientQuestionnaireSection(uid, "travelHistory", {
    hasTravelled: travelHistory.hasTravelled,
    entries: updatedEntries,
  });

  refresh();
  redirect("/questionnaire/travel-history");
}

export async function removeTravelHistoryEntry(index: number) {
  const { uid } = await requireRole(["client"]);

  const { travelHistory } = getClientQuestionnaire(uid);
  updateClientQuestionnaireSection(uid, "travelHistory", {
    hasTravelled: travelHistory.hasTravelled,
    entries: travelHistory.entries.filter((_, i) => i !== index),
  });

  refresh();
  redirect("/questionnaire/travel-history");
}
