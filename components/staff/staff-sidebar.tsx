import Link from "next/link";
import { SignOutLink } from "./sign-out-link.tsx";

export type StaffRole = "admin" | "rcic";

const NAV_LINKS: Record<StaffRole, { href: string; label: string }[]> = {
  admin: [
    { href: "/admin", label: "Overview" },
    { href: "/admin/clients", label: "All clients" },
    { href: "/admin/clients?status=needs_attention", label: "Review queue" },
    { href: "/admin/invitations", label: "Invitations" },
  ],
  rcic: [
    { href: "/rcic", label: "Overview" },
    { href: "/rcic/clients", label: "All clients" },
    { href: "/rcic/clients?status=needs_attention", label: "Review queue" },
  ],
};

// Shared by both /admin and /rcic layouts — one component, nav links
// vary by role (docs/DECISIONS.md 2026-10-26 established the same
// shared-shell pattern for the dashboards themselves).
export function StaffSidebar({ role }: { role: StaffRole }) {
  return (
    <aside className="flex w-56 shrink-0 flex-col gap-4 border-r border-border px-6 py-8 print:hidden">
      <div>
        <p className="text-xs font-medium text-muted-foreground">WORKSPACE</p>
        <nav className="mt-2 flex flex-col gap-1">
          {NAV_LINKS[role].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-xs font-medium text-muted-foreground">IMMIGRATION SERVICES</p>
        {/* Static — no case-ownership/assignment model exists yet. */}
        <p className="mt-1 text-xs text-muted-foreground">Assigned client cases</p>
      </div>

      <div className="mt-auto">
        <SignOutLink />
      </div>
    </aside>
  );
}
