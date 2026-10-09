"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { applyChecklistAction } from "@/lib/apply-checklist-action.ts";
import { requireRole } from "@/lib/firebase/session.ts";

// RCIC is the sole interface to the client for both outcomes —
// see docs/CURRENT_USER_FLOW_V2.md.
function refreshRcicAndClientViews(itemId: string) {
  revalidatePath("/rcic");
  revalidatePath("/checklist");
  revalidatePath(`/checklist/${itemId}`);
}

export async function approveItem(clientId: string, itemId: string) {
  await requireRole(["rcic"]);
  const result = applyChecklistAction(clientId, itemId, { type: "approve" });

  if (result.error) {
    redirect(`/rcic?error=${encodeURIComponent(result.error)}`);
  }

  refreshRcicAndClientViews(itemId);
  redirect("/rcic");
}

export async function requestChanges(clientId: string, itemId: string, formData: FormData) {
  await requireRole(["rcic"]);
  const comment = String(formData.get("comment") ?? "").trim();

  if (!comment) {
    redirect(`/rcic?error=${encodeURIComponent("Add a comment before requesting changes.")}`);
  }

  const result = applyChecklistAction(clientId, itemId, { type: "request_changes", comment });

  if (result.error) {
    redirect(`/rcic?error=${encodeURIComponent(result.error)}`);
  }

  refreshRcicAndClientViews(itemId);
  redirect("/rcic");
}
