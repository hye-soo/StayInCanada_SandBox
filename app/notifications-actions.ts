"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/firebase/session.ts";
import { getNotificationStore } from "@/lib/notification-store.ts";
import { recipientIdFor } from "@/lib/recipient-notifications.ts";

// Marks a notification read, then takes the viewer straight to what
// they need to review/approve. A client can only open their own
// notifications; Admin/RCIC share one inbox per role.
export async function openNotification(id: string, href: string) {
  const session = await requireRole(["client", "admin", "rcic"]);
  getNotificationStore().markRead(recipientIdFor(session), id);

  revalidatePath("/updates");
  revalidatePath("/admin/notifications");
  revalidatePath("/rcic/notifications");
  redirect(href);
}
