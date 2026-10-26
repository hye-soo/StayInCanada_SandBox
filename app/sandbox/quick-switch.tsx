"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase/client.ts";
import { createSession } from "@/lib/firebase/session-actions.ts";
import { ROLE_LANDING } from "@/lib/role-landing.ts";
import { DEMO_ROLES } from "@/lib/sandbox/demo-accounts.ts";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/lib/types.ts";
import { mintDemoToken } from "./demo-session-actions.ts";

const ROLE_LABEL: Record<UserRole, string> = {
  client: "Client",
  admin: "Admin",
  rcic: "RCIC",
};

export function QuickSwitch() {
  const router = useRouter();
  const [pending, setPending] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function switchTo(role: UserRole) {
    setError(null);
    setPending(role);
    try {
      const token = await mintDemoToken(role);
      const credential = await signInWithCustomToken(auth, token);
      await createSession(await credential.user.getIdToken());
      router.push(ROLE_LANDING[role]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not switch role.");
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-border bg-card p-4">
      <h2 className="text-sm font-medium">Quick switch (demo accounts)</h2>
      <div className="flex gap-2">
        {DEMO_ROLES.map((role) => (
          <Button
            key={role}
            variant="outline"
            disabled={pending !== null}
            onClick={() => switchTo(role)}
          >
            {pending === role ? "Switching..." : ROLE_LABEL[role]}
          </Button>
        ))}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
