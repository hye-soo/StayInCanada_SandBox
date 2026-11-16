import { getChecklistStore } from "./checklist-store.ts";
import { transitionChecklistItem, type ChecklistAction, type TransitionResult } from "./checklist-transitions.ts";
import { getActivityLogStore } from "./activity-log-store.ts";
import { getNotificationStore } from "./notification-store.ts";
import { getMemoStore } from "./memo-store.ts";

// Mocked email + a real, clickable in-app notification for whoever
// needs to act next (docs/DECISIONS.md 2026-10-26) — no real email
// provider is wired up yet, so "sending" just logs to this client's
// activity log alongside the actual notification.
function notifyForAction(
  clientId: string,
  itemId: string,
  label: string,
  action: ChecklistAction,
  actorName: string
): void {
  const activityLog = getActivityLogStore();
  const notifications = getNotificationStore();

  switch (action.type) {
    case "request_changes":
      activityLog.append(
        clientId,
        `${actorName} requested changes on "${label}" — client notified by email (mocked)`
      );
      notifications.create(clientId, `${actorName} flagged "${label}" — check your checklist`, `/checklist/${itemId}`);
      break;
    case "flag_for_admin":
      activityLog.append(
        clientId,
        `${actorName} (RCIC) flagged "${label}" for Admin — Admin notified by email (mocked)`
      );
      notifications.create("admin", `RCIC flagged "${label}" for a client — needs your review`, `/admin/${clientId}`);
      break;
    case "mark_reviewed":
      activityLog.append(
        clientId,
        `${actorName} forwarded "${label}" to RCIC — RCIC notified by email (mocked)`
      );
      notifications.create("rcic", `${actorName} forwarded "${label}" for a client — ready for your review`, `/rcic/${clientId}`);
      break;
    case "upload":
      notifications.create(
        "admin",
        `A client uploaded "${label}" — ready for your quality check`,
        `/admin/${clientId}`
      );
      break;
    case "approve":
      notifications.create(
        clientId,
        `Your ${label.toLowerCase()} was approved`,
        `/checklist/${itemId}`,
        "Your case team approved this document. No action is needed from you."
      );
      break;
  }
}

// A change request also opens a memo thread the client can reply to
// (Figma "Memo & Updates": "Passport scan needs replacing").
export function openChangeRequestMemo(clientId: string, itemId: string, label: string, comment: string, authorName: string) {
  return getMemoStore().create(clientId, {
    from: "staff",
    authorName,
    subject: `${label} needs replacing`,
    body: comment,
    related: { label: `Document checklist · ${label}`, href: `/checklist/${itemId}` },
    actionLabel: "Open document",
  });
}

// Thin orchestration: looks up the given client's item, runs it
// through the one transition function, persists the result, and fires
// the mocked-email + real notification side effect. clientId must come
// from a server-verified source (lib/firebase/session.ts's
// requireRole()), never trusted from client input.
export function applyChecklistAction(
  clientId: string,
  itemId: string,
  action: ChecklistAction,
  actorName = "Staff"
): TransitionResult {
  const store = getChecklistStore();
  const item = store.getItem(clientId, itemId);
  if (!item) return { error: "Checklist item not found." };

  const result = transitionChecklistItem(item, action);
  if (result.item && action.type === "upload") result.item.submittedAt = Date.now();
  if (result.item) {
    store.updateItem(clientId, result.item);
    notifyForAction(clientId, itemId, result.item.label, action, actorName);
    if (action.type === "request_changes" && result.item.staffComment) {
      openChangeRequestMemo(clientId, itemId, result.item.label, result.item.staffComment, actorName);
    }
  }
  return result;
}
