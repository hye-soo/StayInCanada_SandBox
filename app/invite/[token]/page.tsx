import { getInviteStore, isInviteValid } from "@/lib/invite-store.ts";
import { InviteSignupForm } from "./signup-form.tsx";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = getInviteStore().get(token);

  if (!isInviteValid(invite)) {
    return (
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-4 px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Invitation not valid</h1>
        <p className="text-sm text-muted-foreground">
          This invitation link is invalid or has already been used. Ask your advisor for a new
          one.
        </p>
      </main>
    );
  }

  return <InviteSignupForm token={token} email={invite.email} />;
}
