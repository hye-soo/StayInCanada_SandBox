"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { applyChecklistAction } from "@/lib/apply-checklist-action.ts";
import { requireRole } from "@/lib/firebase/session.ts";
import { isPdfBytes, validateUploadFile } from "@/lib/upload-validation.ts";
import { getUploadedFileStore } from "@/lib/uploaded-file-store.ts";

// Upload: keeps the PDF in memory for "View submitted file", records
// its name and size, moves the item to "Submitted" and tells Admin, then
// shows Figma
// "Upload flow • 05 • Submitted confirmation".
export async function uploadMockFile(itemId: string, formData: FormData) {
  // Identity comes from the verified session, never from client input.
  const { uid } = await requireRole(["client"]);
  const file = formData.get("file");
  const back = (error: string) => redirect(`/checklist/${itemId}?error=${encodeURIComponent(error)}`);

  if (!(file instanceof File) || !file.name) back("Choose a file to upload.");
  const upload = file as File;
  const problem = validateUploadFile(upload);
  if (problem) back(problem);
  const bytes = new Uint8Array(await upload.arrayBuffer());
  if (!isPdfBytes(bytes)) back("This file isn't a readable PDF. Save your document as a PDF and try again.");

  const result = applyChecklistAction(uid, itemId, {
    type: "upload",
    file: { name: upload.name, size: upload.size },
  });
  if (result.error) back(result.error);
  getUploadedFileStore().save(uid, itemId, { name: upload.name, bytes });

  revalidatePath("/checklist");
  revalidatePath(`/checklist/${itemId}`);
  redirect(`/checklist/${itemId}?submitted=1`);
}
