"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

// Figma "Client profile tabs": text tabs, the current one underlined.
// A tab is current on its own page and any page nested under it; the
// first tab (the base path) only on its exact page.
export function TabNav({ tabs }: { tabs: { href: string; label: string }[] }) {
  const pathname = usePathname();
  const [base] = tabs;

  return (
    <nav className="flex gap-4 overflow-x-auto">
      {tabs.map((tab) => {
        const active =
          tab === base ? pathname === tab.href : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-12 shrink-0 items-center border-b-2 px-3 text-sm font-semibold whitespace-nowrap",
              active ? "border-primary text-primary" : "border-transparent text-foreground hover:text-primary"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
