import { requireRole } from "@/lib/firebase/session.ts";
import { ensureDemoClients } from "@/lib/demo-clients.ts";
import { AppShell } from "@/components/layouts/app-shell";
import type { SidebarNavItem } from "@/components/layouts/sidebar-nav";

// Figma "Navigation / Admin".
const NAV_ITEMS: SidebarNavItem[] = [
  { href: "/admin", label: "Overview", icon: "/icons/stats.svg", exact: true },
  { href: "/admin/clients", label: "All clients", icon: "/icons/following.svg", fallback: true },
  { href: "/admin/review-queue", label: "Review queue", icon: "/icons/list-check.svg" },
  { href: "/admin/notifications", label: "Updates & Memo", icon: "/icons/time-forward.svg" },
  { href: "/admin/invitations", label: "Invitations", icon: "/icons/envelope.svg" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { displayName, email } = await requireRole(["admin"]);
  // Demo caseload for the staff screens (idempotent).
  ensureDemoClients();
  return (
    <AppShell navItems={NAV_ITEMS} user={{ name: displayName ?? email ?? "Staff", role: "Case coordinator" }}>
      {children}
    </AppShell>
  );
}
