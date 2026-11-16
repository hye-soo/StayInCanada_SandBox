import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { openNotification } from "@/app/notifications-actions.ts";
import type { Notification } from "@/lib/notification-store.ts";

// Shared by /admin/notifications and /rcic/notifications — same list,
// each mounted at its own role-gated route.
export function NotificationList({ notifications }: { notifications: Notification[] }) {
  if (notifications.length === 0) {
    return <p className="text-sm text-muted-foreground">No notifications yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {notifications.map((notification) => (
        <li key={notification.id}>
          <Card className={notification.readAt ? "opacity-60" : undefined}>
            <CardHeader>
              <CardTitle className="text-base">{notification.message}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {new Date(notification.createdAt).toLocaleString()}
            </CardContent>
            <CardFooter>
              <form action={openNotification.bind(null, notification.id, notification.href)}>
                <Button type="submit" variant="outline" size="sm">
                  Open
                </Button>
              </form>
            </CardFooter>
          </Card>
        </li>
      ))}
    </ul>
  );
}
