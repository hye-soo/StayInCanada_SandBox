"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientQuestionnaire, updateClientQuestionnaireSection } from "@/lib/client-questionnaire.ts";
import { ADDRESS_HISTORY_ENTRY_FIELDS } from "@/lib/questionnaire-fields.ts";
import type { AddressHistoryEntry } from "@/lib/types.ts";

export async function addAddressHistoryEntry(formData: FormData) {
  const { uid } = await requireRole(["client"]);

  const entry: AddressHistoryEntry = {};
  for (const field of ADDRESS_HISTORY_ENTRY_FIELDS) {
    const value = formData.get(field.name as string);
    entry[field.name] = typeof value === "string" ? value : "";
  }

  const { addressHistory } = getClientQuestionnaire(uid);
  updateClientQuestionnaireSection(uid, "addressHistory", [...addressHistory, entry]);

  revalidatePath("/questionnaire");
  revalidatePath("/questionnaire/address-history");
  redirect("/questionnaire/address-history");
}
