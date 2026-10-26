"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { applyChecklistAction } from "@/lib/apply-checklist-action.ts";
import { requireRole } from "@/lib/firebase/session.ts";

export async function uploadMockFile(itemId: string, formData: FormData) {
  // Identity comes from the verified session, never from client input.
  const { uid } = await requireRole(["client"]);
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0 || !file.name) {
    redirect(`/checklist/${itemId}?error=${encodeURIComponent("Choose a file to upload.")}`);
  }

  const result = applyChecklistAction(uid, itemId, {
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
