import Link from "next/link";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientProfile } from "@/lib/client-profile.ts";
import { getClientChecklist, VISA_TYPE_LABEL } from "@/lib/client-checklist.ts";

const NAV_LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/questionnaire", label: "Your intake" },
  { href: "/checklist", label: "Documents" },
];

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const { uid } = await requireRole(["client"]);
  const { visaType } = getClientChecklist(uid);
  const profile = getClientProfile(uid);

  return (
    <div className="flex flex-1">
      <aside className="flex w-56 shrink-0 flex-col gap-4 border-r border-border px-6 py-8">
        <div>
          <p className="text-xs font-medium text-muted-foreground">MY APPLICATION</p>
          <nav className="mt-2 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
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
        <div className="text-xs text-muted-foreground">
          <p>{VISA_TYPE_LABEL[visaType]}</p>
          <p>Advisor: {profile.assignedAdvisorName}</p>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
