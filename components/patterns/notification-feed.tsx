import Link from "next/link";
import { cn } from "cn";
import { formatTimeAgo } from "@/lib/format-time.ts";
import type { Notification } from "@/lib/notification-store.ts";

// Figma "Latest Notifications" rows: unread are blue-tinted, read ones
// lime-tinted; each opens what it's about.
export function NotificationFeed({ notifications }: { notifications: Notification[] }) {
  if (notifications.length === 0) {
    return <p className="px-2 text-sm text-muted-foreground">No notifications yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-5">
      {notifications.map((notification) => (
        <li key={notification.id}>
          <Link
            href={notification.href}
            className={cn(
              "flex flex-col gap-px rounded-2xl px-6 py-2.5 text-[15px] text-foreground",
              notification.readAt ? "bg-lime-tint" : "bg-sky-tint"
            )}
          >
            <span className="flex items-end justify-between gap-4">
              <span className="font-semibold tracking-[-0.02em]">{notification.message}</span>
              <span className="shrink-0 text-xs opacity-50">{formatTimeAgo(notification.createdAt)}</span>
            </span>
            {notification.detail ? (
              <span className="tracking-[-0.05em]">{notification.detail}</span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
