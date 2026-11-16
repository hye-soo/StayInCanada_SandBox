"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/firebase/session.ts";
import { getInviteStore } from "@/lib/invite-store.ts";

export async function createInvite(formData: FormData) {
  await requireRole(["admin"]);
  const email = String(formData.get("email") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!email) {
    redirect(`/admin/invitations?error=${encodeURIComponent("Enter a client email.")}`);
  }

  const invite = getInviteStore().create(email, name || undefined);
  redirect(`/admin/invitations?created=${invite.token}`);
}
