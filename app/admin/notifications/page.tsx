import Link from "next/link";
import { requireRole } from "@/lib/firebase/session.ts";
import { getNotificationsFor } from "@/lib/recipient-notifications.ts";
import { NotificationList } from "@/components/staff/notification-list.tsx";

export default async function AdminNotificationsPage() {
  const session = await requireRole(["admin"]);
  const notifications = getNotificationsFor(session);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <Link href="/admin" className="text-sm text-muted-foreground hover:underline">
          Back to overview
        </Link>
      </div>
      <NotificationList notifications={notifications} />
    </main>
  );
}
