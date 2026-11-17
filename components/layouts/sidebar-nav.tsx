"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { signOut } from "firebase/auth";
import { cn } from "cn";
import { auth } from "@/lib/firebase/client.ts";
import { clearSession } from "@/lib/firebase/session-actions.ts";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";

export interface SidebarNavItem {
  href: string;
  label: string;
  icon: string;
  // Active only on its own page, not on pages nested under it.
  exact?: boolean;
  // Active when no other item matches (e.g. "All clients" on a client profile).
  fallback?: boolean;
}

// Signed-in staff member, shown at the foot of the sidebar (Figma S01).
export interface SidebarUser {
  name: string;
  role: string;
}

const ITEM_CLASS =
  "flex h-12 items-center gap-2 rounded-full pr-3 pl-[14px] text-sm font-semibold whitespace-nowrap transition-colors";

// Navy rounded sidebar from Figma "Navigation / Client". Items come in
// as props so staff workspaces can reuse it with their own links.
export function SidebarNav({ items, user }: { items: SidebarNavItem[]; user?: SidebarUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  // The most specific matching link wins, so "/admin" (Overview) isn't
  // also highlighted on every "/admin/..." page; a link with a query
  // only matches when the current URL has those same params.
  const activeHref =
    items
      .filter((item) => {
        const [path, query] = item.href.split("?") as [string, string | undefined];
        const pathMatches = pathname === path || (!item.exact && pathname.startsWith(`${path}/`));
        const queryMatches = [...new URLSearchParams(query).entries()].every(
          ([key, value]) => searchParams.get(key) === value
        );
        return pathMatches && queryMatches;
      })
      .map((item) => item.href)
      .sort((a, b) => b.length - a.length)[0] ?? items.find((item) => item.fallback)?.href;

  async function handleSignOut() {
    if (auth) await signOut(auth);
    await clearSession();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex shrink-0 flex-col gap-6 rounded-[30px] bg-navy px-[14px] py-8 text-white print:hidden lg:sticky lg:top-8 lg:h-[calc(100dvh-4rem)] lg:w-[220px]">
      <Logo variant="full-on-dark" className="h-7 self-start" />

      <nav className="flex flex-wrap gap-3 lg:flex-col">
        {items.map((item) => {
          const active = item.href === activeHref;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                ITEM_CLASS,
                active ? "bg-lime-soft text-foreground" : "hover:bg-white/10"
              )}
            >
              <Icon src={item.icon} className={active ? "text-navy" : "text-icon-muted"} />
              {item.label}
            </Link>
          );
        })}

        <hr className="hidden border-muted-foreground lg:mx-1.5 lg:block" />

        <button type="button" onClick={handleSignOut} className={cn(ITEM_CLASS, "hover:bg-white/10")}>
          <Icon src="/icons/sign-out.svg" className="text-icon-muted" />
          Sign Out
        </button>
      </nav>

      {user ? (
        <div className="mt-auto hidden items-center gap-3 px-1 lg:flex">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-tint text-xs font-semibold text-navy"
          >
            {user.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold">{user.name}</span>
            <span className="truncate text-xs text-icon-muted">{user.role}</span>
          </span>
        </div>
      ) : null}
    </aside>
  );
}
