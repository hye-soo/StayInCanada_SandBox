import { requireRole } from "@/lib/firebase/session.ts";
import { AppShell } from "@/components/layouts/app-shell";
import type { SidebarNavItem } from "@/components/layouts/sidebar-nav";

// Figma "Navigation / Admin".
const NAV_ITEMS: SidebarNavItem[] = [
  { href: "/admin", label: "Overview", icon: "/icons/stats.svg", exact: true },
  { href: "/admin/clients", label: "All clients", icon: "/icons/following.svg", fallback: true },
  { href: "/admin/clients?status=needs_attention", label: "Review queue", icon: "/icons/list-check.svg" },
  { href: "/admin/notifications", label: "Updates & Memo", icon: "/icons/time-forward.svg" },
  { href: "/admin/invitations", label: "Invitations", icon: "/icons/envelope.svg" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["admin"]);
  return <AppShell navItems={NAV_ITEMS}>{children}</AppShell>;
}
