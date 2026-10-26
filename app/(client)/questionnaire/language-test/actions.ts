"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/firebase/session.ts";
import { updateClientQuestionnaireSection } from "@/lib/client-questionnaire.ts";
import type { LanguageTestSection } from "@/lib/types.ts";

export async function saveLanguageTest(formData: FormData) {
  const { uid } = await requireRole(["client"]);

  const value = formData.get("hasTakenTest");
  const data: LanguageTestSection = {
    hasTakenTest: value === "yes" || value === "no" ? value : undefined,
  };
  updateClientQuestionnaireSection(uid, "languageTest", data);

  revalidatePath("/questionnaire");
  revalidatePath("/questionnaire/language-test");
  redirect("/questionnaire");
}
