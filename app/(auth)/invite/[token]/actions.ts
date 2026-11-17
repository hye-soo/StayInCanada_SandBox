"use server";

import { getClientProfileStore } from "@/lib/client-profile-store.ts";
import { getChecklistStore } from "@/lib/checklist-store.ts";
import { redirect } from "next/navigation";
import { getInviteStore, isInviteValid } from "@/lib/invite-store.ts";
import { getMockAuthStore } from "@/lib/mock-auth-store.ts";
import { getNotificationStore } from "@/lib/notification-store.ts";
import { startMockSession } from "@/lib/mock-session.ts";
import { validateAccountForm, type AccountFormErrors } from "@/lib/account-validation.ts";

export interface AcceptInviteState {
  name: string;
  errors: AccountFormErrors & { form?: string };
}

export async function acceptInvite(
  _prev: AcceptInviteState,
  formData: FormData
): Promise<AcceptInviteState> {
  const token = String(formData.get("token") ?? "");
  const input = {
    name: String(formData.get("name") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    acceptedTerms: formData.get("acceptedTerms") === "on",
  };

  const errors = validateAccountForm(input);
  if (Object.keys(errors).length > 0) return { name: input.name, errors };

  // No await between the validity check and markUsed, so a link can't be
  // claimed twice (Node's event loop runs this block atomically).
  const invite = getInviteStore().get(token);
  if (!isInviteValid(invite)) {
    return { name: input.name, errors: { form: "This invitation link is no longer valid." } };
  }
  getInviteStore().markUsed(token);

  const user = getMockAuthStore().activateClient({
    email: invite.email,
    name: input.name,
    password: input.password,
  });
  getClientProfileStore().updateProfile(user.id, { applicationType: invite.applicationType });
  // Touching the checklist puts the new client on the staff screens.
  getChecklistStore().getChecklist(user.id);
  getNotificationStore().create(
    user.id,
    "Welcome to FlowOui!",
    "/questionnaire",
    "Your account is ready. Start with your intake."
  );
  await startMockSession(user);
  redirect("/dashboard");
}
