import Link from "next/link";
import { requireRole } from "@/lib/firebase/session.ts";
import { getInviteStore } from "@/lib/invite-store.ts";
import { Button } from "@/components/ui/button";
import { createInvite } from "./actions.ts";

export default async function AdminInvitationsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string }>;
}) {
  await requireRole(["admin"]);
  const { created, error } = await searchParams;
  const invite = created ? getInviteStore().get(created) : undefined;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Client invitation</h1>
        <Link href="/admin" className="text-sm text-muted-foreground hover:underline">
          Back to overview
        </Link>
      </div>
      <p className="text-sm text-muted-foreground">
        Onboarding • After consultation, retainer and payment
      </p>

      <form
        action={createInvite}
        className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border p-6"
      >
        <label className="flex flex-col gap-1 text-sm">
          Client email
          <input
            type="email"
            name="email"
            required
            placeholder="client@example.com"
            className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
          />
        </label>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="self-start">
          Create invitation
        </Button>
      </form>

      {invite ? (
        <div className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-border bg-muted/50 p-6">
          <h2 className="text-lg font-semibold">Invitation link ready to share</h2>
          <p className="text-sm text-muted-foreground">
            Send this link to {invite.email}. It works once.
          </p>
          <code className="break-all rounded-md bg-background px-3 py-2 text-sm">
            /invite/{invite.token}
          </code>
        </div>
      ) : null}
    </main>
  );
}
