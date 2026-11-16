"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { applyChecklistAction } from "@/lib/apply-checklist-action.ts";
import { applySubmissionAction } from "@/lib/apply-submission-action.ts";
import { flagIntakeCategory } from "@/lib/apply-questionnaire-flag.ts";
import { getIntakeReviewStore } from "@/lib/intake-review-store.ts";
import { getActivityLogStore } from "@/lib/activity-log-store.ts";
import { INTAKE_CATEGORIES, type IntakeCategoryId } from "@/lib/data/intake-steps.ts";
import { requireRole } from "@/lib/firebase/session.ts";

function tabPath(clientId: string, tab: "checklist" | "intake" | "package") {
  return `/admin/${clientId}/${tab}`;
}

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

// clientId identifies whose item this is; the actor's own identity is
// independently verified via requireRole, not trusted from client input.
export async function forwardToRcic(clientId: string, itemId: string, formData: FormData) {
  const session = await requireRole(["admin"]);
  const actorName = session.displayName || session.email || "Admin";
  const note = String(formData.get("note") ?? "").trim() || undefined;
  const path = tabPath(clientId, "checklist");
  const result = applyChecklistAction(clientId, itemId, { type: "mark_reviewed", note }, actorName);

  if (result.error) fail(path, result.error);

  revalidatePath(`/admin/${clientId}`, "layout");
  revalidatePath(`/rcic/${clientId}`);
  redirect(path);
}

// Admin is the sole client-facing gate (docs/DECISIONS.md 2026-10-26):
// Admin can flag a document straight back to the client, whether from
// Admin's own quality check or to resolve an RCIC-flagged note.
export async function requestChanges(clientId: string, itemId: string, formData: FormData) {
  const session = await requireRole(["admin"]);
  const actorName = session.displayName || session.email || "Admin";
  const comment = String(formData.get("comment") ?? "").trim();
  const path = tabPath(clientId, "checklist");

  if (!comment) fail(path, "Add a message for the client before requesting changes.");

  const result = applyChecklistAction(clientId, itemId, { type: "request_changes", comment }, actorName);
  if (result.error) fail(path, result.error);

  revalidatePath(`/admin/${clientId}`, "layout");
  revalidatePath("/checklist");
  revalidatePath(`/checklist/${itemId}`);
  redirect(path);
}

// Admin sends an intake category back to the client (docs/DECISIONS.md
// 2026-10-26: Admin does all client-facing operational work).
export async function sendIntakeCategoryBack(
  clientId: string,
  category: IntakeCategoryId,
  formData: FormData
) {
  const session = await requireRole(["admin"]);
  const actorName = session.displayName || session.email || "Admin";
  const note = String(formData.get("note") ?? "").trim();
  const path = tabPath(clientId, "intake");

  if (!note) fail(`${path}/${category}`, "Add a message before sending this back.");

  flagIntakeCategory(clientId, category, note, actorName);

  revalidatePath(`/admin/${clientId}`, "layout");
  revalidatePath("/questionnaire");
  redirect(path);
}

export async function markCategoryReviewed(clientId: string, category: IntakeCategoryId) {
  const session = await requireRole(["admin"]);
  const actorName = session.displayName || session.email || "Admin";

  const label = INTAKE_CATEGORIES.find((c) => c.id === category)?.label ?? category;
  getIntakeReviewStore().markReviewed(clientId, category);
  getActivityLogStore().append(clientId, `${actorName} reviewed "${label}"`);

  revalidatePath(`/admin/${clientId}`, "layout");
  redirect(tabPath(clientId, "intake"));
}

// Phase 4b (docs/DECISIONS.md 2026-10-26): once RCIC has validated the
// client's requirements, Admin prepares the package for RCIC's final
// package-level review.
export async function preparePackage(clientId: string) {
  const session = await requireRole(["admin"]);
  const actorName = session.displayName || session.email || "Admin";
  const path = tabPath(clientId, "package");
  const result = applySubmissionAction(clientId, { type: "prepare_package", preparedBy: actorName }, actorName);

  if (result.error) fail(path, result.error);

  revalidatePath(`/admin/${clientId}`, "layout");
  revalidatePath(`/rcic/${clientId}`);
  revalidatePath("/dashboard");
  redirect(path);
}
