import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/layouts/auth-shell";
import { getSessionUser } from "@/lib/firebase/session.ts";
import { LAST_USER_COOKIE_NAME } from "@/lib/firebase/session-constants.ts";
import { ROLE_LANDING } from "@/lib/role-landing.ts";
import { SignInForm } from "./sign-in-form.tsx";

// A02 — shared by clients and staff; redirects by role after sign-in.
export default async function SignInPage() {
  const user = await getSessionUser();
  if (user) redirect(ROLE_LANDING[user.role]);

  const lastName = (await cookies()).get(LAST_USER_COOKIE_NAME)?.value;

  return (
    <AuthShell
      heroTitle="Your next step is clear"
      heroBody={<p>See where your application stands and what needs your attention</p>}
      title={lastName ? `Welcome back ${lastName}!` : "Welcome back!"}
    >
      <SignInForm />
    </AuthShell>
  );
}
