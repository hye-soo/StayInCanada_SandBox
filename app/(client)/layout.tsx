import { requireRole } from "@/lib/firebase/session.ts";
import { ensureDemoClients } from "@/lib/demo-clients.ts";
import { AppShell } from "@/components/layouts/app-shell";
import type { SidebarNavItem } from "@/components/layouts/sidebar-nav";

const NAV_ITEMS: SidebarNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "/icons/stats.svg" },
  { href: "/questionnaire", label: "My Intake", icon: "/icons/document.svg" },
  { href: "/checklist", label: "Document Checklist", icon: "/icons/list-check.svg" },
  { href: "/updates", label: "Updates & Memo", icon: "/icons/time-forward.svg" },
  { href: "/profile", label: "My Profile", icon: "/icons/user.svg" },
];

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["client"]);
  // Demo data (staff memos, caseload) so feeds aren't empty after a reset.
  ensureDemoClients();
  return <AppShell navItems={NAV_ITEMS}>{children}</AppShell>;
}
