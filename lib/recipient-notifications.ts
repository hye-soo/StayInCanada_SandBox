import { getNotificationStore, type Notification } from "./notification-store.ts";
import type { SessionUser } from "./firebase/session.ts";

// A client's inbox is keyed by their own uid; Admin/RCIC share one
// inbox each (no per-staff-member assignment model exists yet — see
// docs/DECISIONS.md). This is the one place that mapping lives.
export function recipientIdFor(session: SessionUser): string {
  return session.role === "client" ? session.uid : session.role;
}

export function getUnreadCount(session: SessionUser): number {
  return getNotificationStore()
    .getForRecipient(recipientIdFor(session))
    .filter((n) => !n.readAt).length;
}

export function getNotificationsFor(session: SessionUser): Notification[] {
  return getNotificationStore().getForRecipient(recipientIdFor(session));
}
