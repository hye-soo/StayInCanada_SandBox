export interface Notification {
  id: string;
  message: string;
  // Optional second line, shown under the message.
  detail?: string;
  href: string;
  createdAt: number;
  readAt?: number;
}

export interface NotificationStore {
  create(recipientId: string, message: string, href: string, detail?: string): void;
  getForRecipient(recipientId: string): Notification[];
  markRead(recipientId: string, id: string): void;
}

// ponytail: in-memory, newest-first, same pattern as
// lib/activity-log-store.ts. recipientId is a client's own uid for
// client-bound notifications, or the literal role string
// ("admin"/"rcic") for staff — there's no per-staff-member assignment
// model yet (docs/DECISIONS.md), so Admin/RCIC share one inbox each.
class InMemoryNotificationStore implements NotificationStore {
  private readonly byRecipient = new Map<string, Notification[]>();
  private nextId = 1;

  create(recipientId: string, message: string, href: string, detail?: string): void {
    const notifications = this.byRecipient.get(recipientId) ?? [];
    notifications.unshift({
      id: String(this.nextId++),
      message,
      detail,
      href,
      createdAt: Date.now(),
    });
    this.byRecipient.set(recipientId, notifications);
  }

  getForRecipient(recipientId: string): Notification[] {
    return this.byRecipient.get(recipientId) ?? [];
  }

  markRead(recipientId: string, id: string): void {
    const notification = (this.byRecipient.get(recipientId) ?? []).find((n) => n.id === id);
    if (notification) notification.readAt = Date.now();
  }
}

let store: NotificationStore | undefined;

export function getNotificationStore(): NotificationStore {
  if (!store) store = new InMemoryNotificationStore();
  return store;
}

// Demo only: drop every notification.
export function resetNotificationStore(): void {
  store = undefined;
}
