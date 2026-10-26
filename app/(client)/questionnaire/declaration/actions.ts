"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/firebase/session.ts";
import { updateClientQuestionnaireSection } from "@/lib/client-questionnaire.ts";
import { DECLARATION_FIELDS } from "@/lib/questionnaire-fields.ts";
import type { DeclarationSection } from "@/lib/types.ts";

export async function saveDeclaration(formData: FormData) {
  const { uid } = await requireRole(["client"]);

  const data: DeclarationSection = {};
  for (const field of DECLARATION_FIELDS) {
    const value = formData.get(field.name as string);
    data[field.name] = value === "yes" || value === "no" ? value : undefined;
  }
  updateClientQuestionnaireSection(uid, "declaration", data);

  revalidatePath("/questionnaire");
  revalidatePath("/questionnaire/declaration");
  redirect("/questionnaire");
}
