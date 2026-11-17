"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/firebase/session.ts";
import { APPLICATION_TYPES, getInviteStore } from "@/lib/invite-store.ts";
import { getMockAuthStore } from "@/lib/mock-auth-store.ts";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Staff "Invite a client": after consultation, retainer and payment,
// Admin creates a one-time sign-up link for the client (client accounts
// only; staff accounts are set up separately).
export async function createInvite(formData: FormData) {
  await requireRole(["admin"]);
  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  const type = String(formData.get("applicationType") ?? "");
  const back = (error: string) =>
    redirect(`/admin/invitations?error=${encodeURIComponent(error)}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`);

  if (!name) back("Enter the client's full name.");
  if (!EMAIL.test(email)) back("Enter a valid email address.");
  if (getMockAuthStore().findByEmail(email)?.password) back("This client already has an account.");

  const invite = getInviteStore().create(email, name, APPLICATION_TYPES.includes(type) ? type : undefined);
  revalidatePath("/admin/invitations");
  redirect(`/admin/invitations?created=${invite.token}`);
}
