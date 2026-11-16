import type { ReactNode } from "react";
import { SidebarNav, type SidebarNavItem } from "@/components/layouts/sidebar-nav";

// Page skeleton shared by every signed-in workspace (client, staff):
// navy sidebar on the left, page content on the right.
export function AppShell({ navItems, children }: { navItems: SidebarNavItem[]; children: ReactNode }) {
  return (
    // Capped at the 1440px Figma frame and centred; wider screens get
    // equal margins instead of stretching the sidebar and cards apart.
    <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-8 bg-background p-4 lg:flex-row lg:p-8">
      <SidebarNav items={navItems} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
