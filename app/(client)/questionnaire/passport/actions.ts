"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/firebase/session.ts";
import { updateClientQuestionnaireSection } from "@/lib/client-questionnaire.ts";
import { PASSPORT_FIELDS } from "@/lib/questionnaire-fields.ts";
import type { PassportSection } from "@/lib/types.ts";

export async function savePassport(formData: FormData) {
  const { uid } = await requireRole(["client"]);

  const data: PassportSection = {};
  for (const field of PASSPORT_FIELDS) {
    const value = formData.get(field.name as string);
    data[field.name] = typeof value === "string" ? value : "";
  }
  updateClientQuestionnaireSection(uid, "passport", data);

  revalidatePath("/questionnaire");
  revalidatePath("/questionnaire/passport");
  redirect("/questionnaire");
}
