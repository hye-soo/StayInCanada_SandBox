"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { applyChecklistAction } from "@/lib/apply-checklist-action.ts";
import { applySubmissionAction } from "@/lib/apply-submission-action.ts";
import { requireRole } from "@/lib/firebase/session.ts";

// RCIC is the sole interface to the client for both outcomes —
// see docs/CURRENT_USER_FLOW_V2.md.
function refreshViews(clientId: string, itemId: string) {
  revalidatePath(`/rcic/${clientId}`);
  revalidatePath("/checklist");
  revalidatePath(`/checklist/${itemId}`);
}

export async function approveItem(clientId: string, itemId: string) {
  await requireRole(["rcic"]);
  const result = applyChecklistAction(clientId, itemId, { type: "approve" });

  if (result.error) {
    redirect(`/rcic/${clientId}?error=${encodeURIComponent(result.error)}`);
  }

  refreshViews(clientId, itemId);
  redirect(`/rcic/${clientId}`);
}

// Phase 5 (docs/OUR_USER_FLOW.md): the flow's FINISH — RCIC sends the
// packaged application to IRCC.
export async function sendToIrcc(clientId: string) {
  await requireRole(["rcic"]);
  const result = applySubmissionAction(clientId, { type: "mark_submitted" });

  if (result.error) {
    redirect(`/rcic/${clientId}?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath(`/rcic/${clientId}`);
  revalidatePath(`/admin/${clientId}`);
  revalidatePath("/dashboard");
  redirect(`/rcic/${clientId}`);
}

export async function requestChanges(clientId: string, itemId: string, formData: FormData) {
  await requireRole(["rcic"]);
  const comment = String(formData.get("comment") ?? "").trim();

  if (!comment) {
    redirect(
      `/rcic/${clientId}?error=${encodeURIComponent("Add a comment before requesting changes.")}`
    );
  }

  const result = applyChecklistAction(clientId, itemId, { type: "request_changes", comment });

  if (result.error) {
    redirect(`/rcic/${clientId}?error=${encodeURIComponent(result.error)}`);
  }

  refreshViews(clientId, itemId);
  redirect(`/rcic/${clientId}`);
}
