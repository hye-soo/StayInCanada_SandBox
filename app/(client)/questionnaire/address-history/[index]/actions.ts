"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientQuestionnaire, updateClientQuestionnaireSection } from "@/lib/client-questionnaire.ts";
import { ADDRESS_HISTORY_ENTRY_FIELDS } from "@/lib/questionnaire-fields.ts";
import type { AddressHistoryEntry } from "@/lib/types.ts";

function refresh() {
  revalidatePath("/questionnaire");
  revalidatePath("/questionnaire/address-history");
}

export async function updateAddressHistoryEntry(index: number, formData: FormData) {
  const { uid } = await requireRole(["client"]);

  const entry: AddressHistoryEntry = {};
  for (const field of ADDRESS_HISTORY_ENTRY_FIELDS) {
    const value = formData.get(field.name as string);
    entry[field.name] = typeof value === "string" ? value : "";
  }

  const { addressHistory } = getClientQuestionnaire(uid);
  if (index < 0 || index >= addressHistory.length) {
    throw new Error("Address history entry not found.");
  }

  const updated = [...addressHistory];
  updated[index] = entry;
  updateClientQuestionnaireSection(uid, "addressHistory", updated);

  refresh();
  redirect("/questionnaire/address-history");
}

export async function removeAddressHistoryEntry(index: number) {
  const { uid } = await requireRole(["client"]);

  const { addressHistory } = getClientQuestionnaire(uid);
  updateClientQuestionnaireSection(
    uid,
    "addressHistory",
    addressHistory.filter((_, i) => i !== index)
  );

  refresh();
  redirect("/questionnaire/address-history");
}
