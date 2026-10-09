"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { applyChecklistAction } from "@/lib/apply-checklist-action.ts";

export async function uploadMockFile(itemId: string, formData: FormData) {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0 || !file.name) {
    redirect(`/checklist/${itemId}?error=${encodeURIComponent("Choose a file to upload.")}`);
  }

  const result = applyChecklistAction(itemId, {
    type: "upload",
    file: { name: file.name, size: file.size },
  });

  if (result.error) {
    redirect(`/checklist/${itemId}?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/checklist");
  revalidatePath(`/checklist/${itemId}`);
  redirect(`/checklist/${itemId}`);
}
