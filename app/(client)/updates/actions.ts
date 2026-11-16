"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientChecklist } from "@/lib/client-checklist.ts";
import { getMemoStore, type MemoRelated } from "@/lib/memo-store.ts";
import { getNotificationStore } from "@/lib/notification-store.ts";

const MAX_SUBJECT = 120;
const MAX_BODY = 2000;

function text(formData: FormData, name: string, max: number): string {
  return String(formData.get(name) ?? "").trim().slice(0, max);
}

// "Related to" choices in the New memo dialog; resolved on the server so
// a link always points at one of the client's own pages.
async function relatedFor(clientId: string, key: string): Promise<MemoRelated> {
  if (key === "intake") return { label: "My Intake", href: "/questionnaire" };
  if (key === "checklist") return { label: "Document checklist", href: "/checklist" };
  if (key.startsWith("doc:")) {
    const item = getClientChecklist(clientId).items.find((entry) => `doc:${entry.id}` === key);
    if (item) return { label: `Document checklist · ${item.label}`, href: `/checklist/${item.id}` };
  }
  return { label: "General question" };
}

function done(uid: string, displayName: string | null | undefined, message: string) {
  getNotificationStore().create("admin", `${displayName ?? "A client"} ${message}`, `/admin/${uid}`);
  revalidatePath("/updates");
  revalidatePath("/dashboard");
}

// "+ New memo" / "Ask a question": a new thread waiting on the team.
export async function sendMemo(formData: FormData) {
  const { uid, displayName } = await requireRole(["client"]);
  const subject = text(formData, "subject", MAX_SUBJECT);
  const body = text(formData, "message", MAX_BODY);
  if (!subject || !body) throw new Error("Subject and message are required.");
  getMemoStore().create(uid, {
    from: "client",
    authorName: displayName ?? "You",
    subject,
    body,
    related: await relatedFor(uid, String(formData.get("related") ?? "general")),
  });
  done(uid, displayName, `sent a memo: "${subject}"`);
}

export async function replyToMemo(formData: FormData) {
  const { uid, displayName } = await requireRole(["client"]);
  const memoId = String(formData.get("memoId") ?? "");
  const body = text(formData, "message", MAX_BODY);
  if (!body) throw new Error("Write a reply first.");
  const memo = getMemoStore().reply(uid, memoId, { from: "client", authorName: displayName ?? "You", body });
  if (!memo) throw new Error("This memo no longer exists.");
  done(uid, displayName, `replied to "${memo.subject}"`);
}

export async function editMemo(formData: FormData) {
  const { uid } = await requireRole(["client"]);
  const subject = text(formData, "subject", MAX_SUBJECT);
  const body = text(formData, "message", MAX_BODY);
  if (!subject || !body) throw new Error("Subject and message are required.");
  if (!getMemoStore().edit(uid, String(formData.get("memoId") ?? ""), { subject, body })) {
    throw new Error("This memo can no longer be edited.");
  }
  revalidatePath("/updates");
}

export async function deleteMemo(formData: FormData) {
  const { uid } = await requireRole(["client"]);
  if (!getMemoStore().remove(uid, String(formData.get("memoId") ?? ""))) {
    throw new Error("This memo can no longer be deleted.");
  }
  revalidatePath("/updates");
}

export async function markMemoRead(formData: FormData) {
  const { uid } = await requireRole(["client"]);
  getMemoStore().markRead(uid, String(formData.get("memoId") ?? ""));
  revalidatePath("/updates");
}

export async function markUpdateRead(formData: FormData) {
  const { uid } = await requireRole(["client"]);
  getNotificationStore().markRead(uid, String(formData.get("notificationId") ?? ""));
  revalidatePath("/updates");
  revalidatePath("/dashboard");
}
