import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "cn";
import { getClientChecklist, VISA_TYPE_LABEL } from "@/lib/client-checklist.ts";
import { getClientProfileStore } from "@/lib/client-profile-store.ts";
import { requireRole } from "@/lib/firebase/session.ts";
import { CLIENT_STATUS } from "@/lib/status-display.ts";
import type { ChecklistItem, ChecklistItemStatus } from "@/lib/types.ts";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Icon } from "@/components/ui/icon";

const TABS = [
  { id: "all", label: "All" },
  { id: "mine", label: "Your action" },
  { id: "review", label: "Awaiting review" },
  { id: "done", label: "Completed" },
] as const;

type TabId = (typeof TABS)[number]["id"];


function isYourAction(item: ChecklistItem): boolean {
  return item.status === "required" || item.status === "changes_required";
}

function matchesTab(item: ChecklistItem, tab: TabId): boolean {
  switch (tab) {
    case "mine":
      return isYourAction(item);
    case "review":
      return item.status === "submitted" || item.status === "under_review";
    case "done":
      return item.status === "approved";
    case "all":
      return true;
  }
}

function StatusCell({ status }: { status: ChecklistItemStatus }) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      {status === "approved" ? (
        <span className="flex size-6 items-center justify-center rounded-full bg-lime-soft text-primary">
          <Check className="size-3.5" strokeWidth={3} aria-hidden />
        </span>
      ) : status === "required" || status === "changes_required" ? (
        <Icon src="/icons/exclamation.svg" className="size-6 text-foreground" />
      ) : null}
      {CLIENT_STATUS[status].label}
    </span>
  );
}

// Figma "C04 Document checklist".
export default async function ChecklistPage({ searchParams }: PageProps<"/checklist">) {
  const { uid } = await requireRole(["client"]);
  const { items, visaType } = getClientChecklist(uid);
  const { applicationId } = getClientProfileStore().getProfile(uid);
  const { tab: rawTab } = await searchParams;
  const tab = (TABS.some((t) => t.id === rawTab) ? rawTab : "all") as TabId;

  const completed = items.filter((item) => item.status === "approved").length;
  const percent = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;
  const changes = items.filter((item) => item.status === "changes_required").length;
  const toUpload = items.filter((item) => item.status === "required").length;
  const attention = changes + toUpload;
  const visibleItems = items.filter((item) => matchesTab(item, tab));

  return (
    <main className="flex flex-col gap-4 pt-2">
      <header className="flex flex-col gap-1">
        <h1 className="text-[32px] font-bold leading-10 text-foreground">Your document checklist</h1>
        <p className="text-sm text-foreground">
          {VISA_TYPE_LABEL[visaType]} • Application {applicationId}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_372px]">
        <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground">
            {completed} of {items.length} requirements completed
          </h2>
          <div className="flex justify-between gap-4 text-sm font-medium">
            <span className="text-foreground">Reviewed and completed by your case team</span>
            <span className="text-primary">{percent}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-lg bg-secondary">
            <div className="h-full rounded-lg bg-linear-to-r from-primary to-lime" style={{ width: `${percent}%` }} />
          </div>
          <p className="text-sm text-muted-foreground">Uploaded files still need review before a requirement is completed.</p>
        </section>

        <section className="relative flex flex-col gap-1 rounded-xl border border-border bg-card px-5 py-7">
          {attention > 0 ? (
            <span className="absolute -top-1.5 -right-1 flex h-6 min-w-7 items-center justify-center rounded-full bg-coral px-2 text-xs text-white">
              {attention}
            </span>
          ) : null}
          <h2 className="text-xl font-semibold text-foreground">
            {attention > 0
              ? `${attention} ${attention === 1 ? "Document needs" : "Documents need"} your attention`
              : "You're all caught up"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {attention > 0 ? "Review the highlighted items below" : "Nothing needs your action right now."}
          </p>
          {attention > 0 ? (
            <ul className="mt-3 list-disc pl-6 text-base text-foreground">
              {changes > 0 ? <li>{changes} {changes === 1 ? "requires" : "require"} changes</li> : null}
              {toUpload > 0 ? <li>{toUpload} still {toUpload === 1 ? "needs" : "need"} to be uploaded</li> : null}
            </ul>
          ) : null}
        </section>
      </div>

      <nav aria-label="Filter documents" className="flex flex-wrap gap-4">
        {TABS.map((t) => {
          const active = tab === t.id;
          const count = items.filter((item) => matchesTab(item, t.id)).length;
          return (
            <Link
              key={t.id}
              href={`/checklist?tab=${t.id}`}
              scroll={false}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold",
                active ? "border-2 border-primary text-primary" : "border border-filter text-filter hover:bg-secondary"
              )}
            >
              {active ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : null}
              {t.label} ({count})
            </Link>
          );
        })}
      </nav>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full table-fixed text-center text-sm text-foreground">
          <thead className="bg-secondary font-medium">
            <tr className="h-[52px]">
              <th className="w-[31%] font-medium">Requirement</th>
              <th className="font-medium">Status</th>
              <th className="font-medium">Next action by</th>
              <th className="font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.length === 0 ? (
              <tr className="h-20 border-t border-border bg-card">
                <td className="text-muted-foreground" colSpan={4}>
                  Nothing here.
                </td>
              </tr>
            ) : (
              visibleItems.map((item) => (
                <tr
                  key={item.id}
                  className={cn("h-20 border-t border-border", isYourAction(item) ? "bg-sky-soft" : "bg-card")}
                >
                  <td className="px-4">{item.label}</td>
                  <td>
                    <StatusCell status={item.status} />
                  </td>
                  <td>{CLIENT_STATUS[item.status].nextBy}</td>
                  <td>
                    <ArrowLink href={`/checklist/${item.id}`}>
                      {isYourAction(item) && !item.fileName ? "Upload file" : "View file"}
                    </ArrowLink>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
