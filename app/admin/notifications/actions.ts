"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/firebase/session.ts";
import { getChecklistStore } from "@/lib/checklist-store.ts";
import { getMemoStore, type MemoRelated } from "@/lib/memo-store.ts";
import { getNotificationStore } from "@/lib/notification-store.ts";
import { recipientIdFor } from "@/lib/recipient-notifications.ts";

const MAX_SUBJECT = 120;
const MAX_BODY = 2000;

function text(formData: FormData, name: string, max: number): string {
  return String(formData.get(name) ?? "").trim().slice(0, max);
}

// Staff may only write to a client who exists in the caseload.
function clientIdFrom(formData: FormData): string {
  const clientId = String(formData.get("clientId") ?? "");
  if (!getChecklistStore().getAllClientIds().includes(clientId)) throw new Error("Unknown client.");
  return clientId;
}

// Links are the client's own pages, so the memo opens the right place
// on their side.
function relatedFor(key: string): MemoRelated {
  if (key === "intake") return { label: "My Intake", href: "/questionnaire" };
  if (key === "checklist") return { label: "Document checklist", href: "/checklist" };
  return { label: "General question" };
}

function refresh() {
  revalidatePath("/admin/notifications");
  revalidatePath("/admin");
  revalidatePath("/updates");
}

// "+ New memo" (staff): starts a thread that waits on the client.
export async function staffSendMemo(formData: FormData) {
  const { displayName } = await requireRole(["admin"]);
  const clientId = clientIdFrom(formData);
  const subject = text(formData, "subject", MAX_SUBJECT);
  const body = text(formData, "message", MAX_BODY);
  if (!subject || !body) throw new Error("Subject and message are required.");
  const related = relatedFor(String(formData.get("related") ?? "general"));
  getMemoStore().create(clientId, {
    from: "staff",
    authorName: displayName ?? "Your case team",
    subject,
    body,
    related,
    actionLabel: related.href ? "Open" : undefined,
  });
  refresh();
}

export async function staffReplyToMemo(formData: FormData) {
  const { displayName } = await requireRole(["admin"]);
  const clientId = clientIdFrom(formData);
  const body = text(formData, "message", MAX_BODY);
  if (!body) throw new Error("Write a reply first.");
  const memo = getMemoStore().reply(clientId, String(formData.get("memoId") ?? ""), {
    from: "staff",
    authorName: displayName ?? "Your case team",
    body,
  });
  if (!memo) throw new Error("This memo no longer exists.");
  refresh();
}

export async function staffMarkMemoRead(formData: FormData) {
  await requireRole(["admin"]);
  getMemoStore().markReadByStaff(clientIdFrom(formData), String(formData.get("memoId") ?? ""));
  refresh();
}

export async function staffMarkUpdateRead(formData: FormData) {
  const session = await requireRole(["admin"]);
  getNotificationStore().markRead(recipientIdFor(session), String(formData.get("notificationId") ?? ""));
  refresh();
}
