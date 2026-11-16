"use server";

import { redirect } from "next/navigation";
import { getMockAuthStore, type SignInError } from "@/lib/mock-auth-store.ts";
import { startMockSession } from "@/lib/mock-session.ts";
import { ROLE_LANDING } from "@/lib/role-landing.ts";

export interface SignInState {
  email: string;
  errors: { email?: string; password?: string };
}

const ERROR_FIELD: Record<SignInError, keyof SignInState["errors"]> = {
  no_account: "email",
  not_activated: "email",
  wrong_password: "password",
};

const ERROR_TEXT: Record<SignInError, string> = {
  no_account: "No account found with this email",
  not_activated: "Your account isn't set up yet. Use the link in your invitation email.",
  wrong_password: "Incorrect password. Try again.",
};

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const result = getMockAuthStore().signIn(email, password);
  if ("error" in result) {
    return { email, errors: { [ERROR_FIELD[result.error]]: ERROR_TEXT[result.error] } };
  }

  await startMockSession(result.user);
  redirect(ROLE_LANDING[result.user.role]);
}
