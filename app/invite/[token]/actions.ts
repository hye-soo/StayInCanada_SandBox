"use server";

import { getInviteStore, isInviteValid } from "@/lib/invite-store.ts";

// Called before account creation, not after: this reserves the
// invite (marks it used) so a stale/reused link can't be claimed
// twice. No `await` happens between the get() and markUsed() below,
// so this check-then-set is atomic within Node's single-threaded
// event loop.
export async function claimInvite(token: string): Promise<{ email?: string; error?: string }> {
  const invite = getInviteStore().get(token);
  if (!isInviteValid(invite)) {
    return { error: "This invitation link is invalid or has already been used." };
  }
  getInviteStore().markUsed(token);
  return { email: invite.email };
}
