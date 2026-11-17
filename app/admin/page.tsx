import { requireRole } from "@/lib/firebase/session.ts";
import { getChecklistStore } from "@/lib/checklist-store.ts";
import { getClientChecklist } from "@/lib/client-checklist.ts";
import { getClientProfile } from "@/lib/client-profile.ts";
import { getClientIdentity } from "@/lib/client-identity.ts";
import { getAdminOverview, type OverviewClient } from "@/lib/staff-overview.ts";
import { formatTimeAgo } from "@/lib/format-time.ts";
import { PageHeader } from "@/components/layouts/page-header";
import { ArrowLink } from "@/components/ui/arrow-link";
import { CaseListCard } from "@/components/patterns/case-list-card";
import { DataTable } from "@/components/patterns/data-table";
import { StatCard } from "@/components/patterns/stat-card";

function overviewClient(clientId: string): OverviewClient {
  const { items } = getClientChecklist(clientId);
  const profile = getClientProfile(clientId);
  return {
    clientId,
    name: getClientIdentity(clientId).name,
    applicationId: profile.applicationId,
    visaTypeLabel: profile.applicationType,
    items,
  };
}

// S01 / Figma "S01 Staff dashboard" (Admin).
export default async function AdminOverviewPage() {
  const { displayName, email } = await requireRole(["admin"]);
  const firstName = displayName?.split(" ")[0] ?? email?.split("@")[0] ?? "there";
  const overview = getAdminOverview(getChecklistStore().getAllClientIds().map(overviewClient));

  return (
    <main className="flex flex-col gap-4 pt-2 lg:pt-[30px]">
      <div className="mb-4">
        <PageHeader title={`Your workspace, ${firstName}!`} subtitle="Have a wonderful day today!" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard label="My active cases" value={overview.activeCases} />
        <StatCard label="Awaiting my review" value={overview.awaitingReview} />
        <StatCard label="Waiting on clients" value={overview.waitingOnClients} />
      </div>

      <DataTable
        title="My review queue"
        meta="Oldest first"
        columns={["Client", "Needs review", "Received", "Action"]}
        emptyMessage="Nothing to review right now."
        rows={overview.reviewQueue.map((row) => ({
          key: `${row.clientId}-${row.itemId}`,
          cells: [
            <span key="client" className="flex flex-col gap-[3px]">
              <span className="font-semibold">{row.clientName}</span>
              <span className="text-muted-foreground">{row.applicationId}</span>
            </span>,
            row.needsReview,
            row.receivedAt ? formatTimeAgo(row.receivedAt) : "—",
            <ArrowLink key="action" href={row.href}>
              {row.actionLabel}
            </ArrowLink>,
          ],
        }))}
      />

      <div className="mt-6 grid grid-cols-1 gap-[15px] md:grid-cols-2">
        <CaseListCard
          title="Waiting on clients"
          icon="/icons/clock.svg"
          actionLabel="View request"
          emptyMessage="No client owes anything right now."
          entries={overview.waitingOnClient.slice(0, 3).map((entry) => ({
            key: entry.clientId,
            name: entry.clientName,
            detail: entry.detail,
            href: entry.href,
          }))}
        />
        <CaseListCard
          title="Ready for consultant review"
          icon="/icons/folder.svg"
          actionLabel="Open handoff"
          emptyMessage="Nothing is with the consultant yet."
          entries={overview.readyForConsultant.slice(0, 3).map((entry) => ({
            key: entry.clientId,
            name: entry.clientName,
            detail: entry.detail,
            href: entry.href,
          }))}
        />
      </div>
    </main>
  );
}
