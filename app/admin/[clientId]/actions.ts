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

// Phase 4b (docs/DECISIONS.md 2026-10-26): once RCIC has validated the
// client's requirements, Admin prepares the package for RCIC's final
// package-level review.
export async function preparePackage(clientId: string) {
  const session = await requireRole(["admin"]);
  const actorName = session.displayName || session.email || "Admin";
  const result = applySubmissionAction(clientId, { type: "prepare_package", preparedBy: actorName }, actorName);

  if (result.error) {
    redirect(`/admin/${clientId}?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath(`/admin/${clientId}`);
  revalidatePath(`/rcic/${clientId}`);
  revalidatePath("/dashboard");
  redirect(`/admin/${clientId}`);
}
