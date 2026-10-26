"use server";

import { adminAuth } from "@/lib/firebase/admin.ts";
import { getDemoUid } from "@/lib/sandbox/demo-accounts.ts";
import type { UserRole } from "@/lib/types.ts";

// Mints a custom-auth token for a pre-seeded demo account, so the
// quick-switch panel can log in as Client/Admin/RCIC without typing a
// password — no new auth mechanism, just Admin SDK custom tokens feeding
// the real sign-in + createSession flow already used by /login.
export async function mintDemoToken(role: UserRole): Promise<string> {
  const uid = getDemoUid(role);
  if (!uid) {
    throw new Error(
      `No demo account configured for role "${role}" — set DEMO_${role.toUpperCase()}_UID in .env.local`
    );
  }
  return adminAuth.createCustomToken(uid);
}
