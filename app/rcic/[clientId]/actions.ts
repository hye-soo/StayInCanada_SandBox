"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { applyChecklistAction } from "@/lib/apply-checklist-action.ts";
import { requireRole } from "@/lib/firebase/session.ts";

// RCIC never contacts the client directly — Admin is the sole
// client-facing gate (docs/DECISIONS.md 2026-10-26).
function refreshViews(clientId: string, itemId: string) {
  revalidatePath(`/rcic/${clientId}`);
  revalidatePath(`/admin/${clientId}`);
  revalidatePath("/checklist");
  revalidatePath(`/checklist/${itemId}`);
}

export async function approveItem(clientId: string, itemId: string) {
  const session = await requireRole(["rcic"]);
  const actorName = session.displayName || session.email || "RCIC";
  const result = applyChecklistAction(clientId, itemId, { type: "approve" }, actorName);

  if (result.error) {
    redirect(`/rcic/${clientId}?error=${encodeURIComponent(result.error)}`);
  }

  refreshViews(clientId, itemId);
  redirect(`/rcic/${clientId}`);
}

// RCIC flags an issue to Admin internally — Admin is the one who
// actually notifies the client.
export async function flagForAdmin(clientId: string, itemId: string, formData: FormData) {
  const session = await requireRole(["rcic"]);
  const actorName = session.displayName || session.email || "RCIC";
  const note = String(formData.get("note") ?? "").trim();

  if (!note) {
    redirect(`/rcic/${clientId}?error=${encodeURIComponent("Add a note for Admin before flagging.")}`);
  }

  const result = applyChecklistAction(clientId, itemId, { type: "flag_for_admin", note }, actorName);

  if (result.error) {
    redirect(`/rcic/${clientId}?error=${encodeURIComponent(result.error)}`);
  }

  refreshViews(clientId, itemId);
  redirect(`/rcic/${clientId}`);
}
