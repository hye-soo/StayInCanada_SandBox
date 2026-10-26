"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client.ts";
import { useAuth } from "@/lib/firebase/auth-context.tsx";
import { clearSession } from "@/lib/firebase/session-actions.ts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROLE_LANDING } from "@/lib/role-landing.ts";
import type { UserRole } from "@/lib/types.ts";

// Client-facing text stays "Staff"-free generally, but here the badge
// only ever renders for the signed-in Admin/RCIC themselves (never
// shown to a client), so naming the actual workspace is fine.
const WORKSPACE_LABEL: Record<UserRole, string> = {
  client: "Client Portal",
  admin: "Admin Workspace",
  rcic: "RCIC Workspace",
};

export function AppHeader() {
  const router = useRouter();
  const { user, role, loading } = useAuth();

  async function handleLogOut() {
    await signOut(auth);
    await clearSession();
    router.push("/login");
  }

  const brandHref = role ? ROLE_LANDING[role] : "/login";
  const displayName = user?.displayName || user?.email?.split("@")[0] || "Account";

  return (
    <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-3 print:hidden">
      <div className="flex items-center gap-3">
        <Link href={brandHref} className="text-lg font-semibold tracking-tight text-primary">
          FlowOui
        </Link>
        {role ? (
          <Badge variant="outline" className="uppercase tracking-wide">
            {WORKSPACE_LABEL[role]}
          </Badge>
        ) : null}
      </div>

      {loading ? (
        <span className="text-xs text-muted-foreground">Loading...</span>
      ) : !user ? (
        <div className="flex items-center gap-3 text-sm">
          <Link href="/login" className="hover:underline">
            Log in
          </Link>
          <Link href="/signup" className="hover:underline">
            Sign up
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">Notifications</span>
          <Badge variant="secondary" className="h-auto px-3 py-1 text-sm">
            {displayName}
          </Badge>
          <Button type="button" variant="outline" size="sm" onClick={handleLogOut}>
            Log out
          </Button>
        </div>
      )}
    </header>
  );
}
