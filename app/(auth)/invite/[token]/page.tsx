import Link from "next/link";
import { AuthShell } from "@/components/layouts/auth-shell";
import { getInviteStore, isInviteValid } from "@/lib/invite-store.ts";
import { AcceptInviteForm } from "./accept-invite-form.tsx";

const HERO_BODY = (
  <>
    <p>You&apos;re invited to take the next step</p>
    <p>See what your case team needs from you and follow your application&apos;s progress</p>
  </>
);

// A01 — client-only. Reached from the invitation email link.
export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = getInviteStore().get(token);

  if (!isInviteValid(invite)) {
    return (
      <AuthShell heroTitle="Welcome to FlowOui" heroBody={HERO_BODY} title="This invitation isn't valid">
        <p className="text-sm text-muted-foreground">
          The link is invalid or has already been used. Ask your case team for a new invitation.
        </p>
        <p className="text-xs font-medium text-foreground">
          Already set up your account?{" "}
          <Link href="/login" className="text-primary underline">
            Sign in
          </Link>
        </p>
      </AuthShell>
    );
  }

  const firstName = invite.name?.split(" ")[0];

  return (
    <AuthShell
      heroTitle={firstName ? `Welcome to FlowOui ${firstName}!` : "Welcome to FlowOui!"}
      heroBody={HERO_BODY}
      title="Create your account"
    >
      <AcceptInviteForm token={token} email={invite.email} name={invite.name ?? ""} />
    </AuthShell>
  );
}
