"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { applyChecklistAction } from "@/lib/apply-checklist-action.ts";
import { applySubmissionAction } from "@/lib/apply-submission-action.ts";
import { requireRole } from "@/lib/firebase/session.ts";

// Admin's only action: forward to RCIC, with an optional internal note
// (visible to RCIC only). Admin never sets client-facing status/comments
// directly — see docs/CURRENT_USER_FLOW_V2.md. clientId identifies
// whose item this is; admin's own identity is independently verified
// via requireRole, not trusted from client input.
export async function forwardToRcic(clientId: string, itemId: string, formData: FormData) {
  await requireRole(["admin"]);
  const note = String(formData.get("note") ?? "").trim() || undefined;
  const result = applyChecklistAction(clientId, itemId, { type: "mark_reviewed", note });

  if (result.error) {
    redirect(`/admin/${clientId}?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath(`/admin/${clientId}`);
  revalidatePath(`/rcic/${clientId}`);
  redirect(`/admin/${clientId}`);
}

// Phase 5 (docs/OUR_USER_FLOW.md): once every checklist item is
// approved, Admin packages the file for RCIC's final review.
export async function markPackageReady(clientId: string) {
  await requireRole(["admin"]);
  const result = applySubmissionAction(clientId, { type: "mark_packaged" });

  if (result.error) {
    redirect(`/admin/${clientId}?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath(`/admin/${clientId}`);
  revalidatePath(`/rcic/${clientId}`);
  revalidatePath("/dashboard");
  redirect(`/admin/${clientId}`);
}
