"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client.ts";
import { clearSession } from "@/lib/firebase/session-actions.ts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
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

const NOTIFICATIONS_HREF: Record<UserRole, string> = {
  client: "/updates",
  admin: "/admin/notifications",
  rcic: "/rcic/notifications",
};

// Auth screens (A01/A02) and the demo inbox are full-bleed, no global header.
const FULL_BLEED_PATHS = ["/login", "/signup", "/invite", "/demo"];

export interface HeaderUser {
  role: UserRole;
  name: string;
}

export function AppHeader({ user }: { user: HeaderUser | null }) {
  const router = useRouter();
  const pathname = usePathname();
  // Clients and Admin navigate with the sidebar (no top bar in Figma).
  if (user?.role === "client" || user?.role === "admin") return null;
  if (FULL_BLEED_PATHS.some((path) => pathname.startsWith(path))) return null;

  async function handleLogOut() {
    if (auth) await signOut(auth);
    await clearSession();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-3 print:hidden">
      <div className="flex items-center gap-3">
        <Link href={user ? ROLE_LANDING[user.role] : "/login"}>
          <Logo variant="full" className="h-7" />
        </Link>
        {user ? (
          <Badge variant="outline" className="uppercase tracking-wide">
            {WORKSPACE_LABEL[user.role]}
          </Badge>
        ) : null}
      </div>

      {user ? (
        <div className="flex items-center gap-3 text-sm">
          <Link href={NOTIFICATIONS_HREF[user.role]} className="text-muted-foreground hover:underline">
            Notifications
          </Link>
          <Badge variant="secondary" className="h-auto px-3 py-1 text-sm">
            {user.name}
          </Badge>
          <Button type="button" variant="outline" size="sm" onClick={handleLogOut}>
            Log out
          </Button>
        </div>
      ) : (
        <Link href="/login" className="text-sm hover:underline">
          Sign in
        </Link>
      )}
    </header>
  );
}
