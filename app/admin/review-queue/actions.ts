"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAiReviewStore, type FindingDecision } from "@/lib/ai-review.ts";
import { applyChecklistAction } from "@/lib/apply-checklist-action.ts";
import { getActivityLogStore } from "@/lib/activity-log-store.ts";
import { getChecklistStore } from "@/lib/checklist-store.ts";
import { requireRole } from "@/lib/firebase/session.ts";

const reviewPath = (clientId: string, itemId: string) => `/admin/review-queue/${clientId}/${itemId}`;

// Staff only. The client must already exist (getItem would otherwise
// create an empty checklist for any id) and the document must be
// waiting on staff.
async function submittedItem(clientId: string, itemId: string) {
  const session = await requireRole(["admin"]);
  const store = getChecklistStore();
  const item = store.getAllClientIds().includes(clientId) ? store.getItem(clientId, itemId) : undefined;
  if (!item || item.status !== "submitted" || !item.fileName) redirect("/admin/review-queue");
  return { actorName: session.displayName || session.email || "Staff", item };
}

function refresh(clientId: string, itemId: string) {
  revalidatePath("/admin", "layout");
  revalidatePath("/checklist");
  revalidatePath(`/checklist/${itemId}`);
  revalidatePath(`/admin/${clientId}`, "layout");
}

// Figma 02 -> 03 / 13: staff confirm, dismiss or reopen the AI finding.
export async function decideFinding(clientId: string, itemId: string, decision: FindingDecision | "reopen") {
  if (decision !== "confirmed" && decision !== "dismissed" && decision !== "reopen") redirect("/admin/review-queue");
  const { actorName, item } = await submittedItem(clientId, itemId);
  getAiReviewStore().decide(clientId, itemId, item.fileName!, decision === "reopen" ? undefined : decision);
  getActivityLogStore().append(
    clientId,
    `${actorName} ${decision === "reopen" ? "reopened" : decision} the AI finding on "${item.label}"`
  );
  revalidatePath(reviewPath(clientId, itemId));
  redirect(reviewPath(clientId, itemId));
}

// Figma 04 -> 05: the (edited) message goes to the client on the
// requirement and as a memo, through the usual request-changes action.
export async function sendChangeRequest(clientId: string, itemId: string, formData: FormData) {
  const { actorName } = await submittedItem(clientId, itemId);
  const comment = String(formData.get("message") ?? "").trim().slice(0, 2000);
  if (!comment) throw new Error("Write a message for the client.");

  const result = applyChecklistAction(clientId, itemId, { type: "request_changes", comment }, actorName);
  if (result.error) throw new Error(result.error);
  refresh(clientId, itemId);
  redirect(reviewPath(clientId, itemId));
}

// Figma 10 -> 11: only a staff click approves; AI never does.
export async function approveDocument(clientId: string, itemId: string) {
  const { actorName, item } = await submittedItem(clientId, itemId);
  const result = applyChecklistAction(clientId, itemId, { type: "approve" }, actorName);
  if (result.error) throw new Error(result.error);
  getAiReviewStore().approve(clientId, itemId, actorName);
  getActivityLogStore().append(clientId, `${actorName} approved "${item.label}"`);
  refresh(clientId, itemId);
  redirect(reviewPath(clientId, itemId));
}
