import Link from "next/link";
import { cn } from "cn";
import { requireRole } from "@/lib/firebase/session.ts";
import { getAllClientSummaries, getClientQueueRows } from "@/lib/client-directory.ts";
import { VISA_TYPE_LABEL } from "@/lib/client-checklist.ts";
import { getClientProfile } from "@/lib/client-profile.ts";
import { getClientIdentity } from "@/lib/client-identity.ts";
import { filterClientRows, type ClientListRow } from "@/lib/client-list.ts";
import { PageHeader } from "@/components/layouts/page-header";
import { DataTable } from "@/components/patterns/data-table";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { VisaType } from "@/lib/types.ts";

function buildRows(): ClientListRow[] {
  const queue = new Map(getClientQueueRows().map((row) => [row.clientId, row]));
  return getAllClientSummaries().map((summary) => {
    const { name, email } = getClientIdentity(summary.clientId);
    const counts = summary.checklistCounts;
    return {
      clientId: summary.clientId,
      name,
      email,
      applicationId: getClientProfile(summary.clientId).applicationId,
      visaType: summary.visaType,
      visaTypeLabel: summary.visaTypeLabel,
      stageLabel: summary.stage.label,
      nextAction: queue.get(summary.clientId)?.nextAction ?? "—",
      needsAttention: counts.required + counts.changes_required + counts.submitted + counts.under_review > 0,
    };
  });
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-12 items-center rounded-full border border-input px-6 text-sm font-semibold text-foreground",
        active ? "bg-secondary" : "bg-card hover:bg-secondary"
      )}
    >
      {children}
    </Link>
  );
}

// Figma "All clients / Staff".
export default async function AdminClientsPage({ searchParams }: PageProps<"/admin/clients">) {
  await requireRole(["admin"]);
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const visaType = typeof params.visaType === "string" ? params.visaType : "";
  const status = typeof params.status === "string" ? params.status : "";

  const allRows = buildRows();
  const rows = filterClientRows(allRows, { q, visaType, status });
  const needsAttentionCount = filterClientRows(allRows, { status: "needs_attention" }).length;

  return (
    <main className="flex flex-col gap-5 pt-2 lg:pt-6">
      <PageHeader
        title="All clients"
        subtitle="Find client profiles, application types and cases requiring attention"
      />

      <form action="/admin/clients" className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-60 flex-[440] flex-col gap-2">
          <Label htmlFor="q">Search clients</Label>
          <Input id="q" name="q" defaultValue={q} placeholder="Name, email or application ID" />
        </div>
        <div className="flex min-w-48 flex-[280] flex-col gap-2">
          <Label htmlFor="visaType">Application type</Label>
          <Select id="visaType" name="visaType" defaultValue={visaType}>
            <option value="">All application types</option>
            {(Object.keys(VISA_TYPE_LABEL) as VisaType[]).map((type) => (
              <option key={type} value={type}>
                {VISA_TYPE_LABEL[type]}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex min-w-48 flex-[280] flex-col gap-2">
          <Label htmlFor="status">Case status</Label>
          <Select id="status" name="status" defaultValue={status}>
            <option value="">All case statuses</option>
            <option value="needs_attention">Needs attention</option>
          </Select>
        </div>
        <Button type="submit" className="h-12 rounded-full px-6 font-semibold">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap gap-4">
        <Chip href="/admin/clients" active={!q && !visaType && !status}>
          All clients ({allRows.length})
        </Chip>
        <Chip href="/admin/clients?status=needs_attention" active={status === "needs_attention" && !q && !visaType}>
          Needs attention ({needsAttentionCount})
        </Chip>
      </div>

      <DataTable
        columns={["Client", "Application", "Stage", "Next action", "Action"]}
        emptyMessage="No clients match your search."
        rows={rows.map((row) => ({
          key: row.clientId,
          cells: [
            <span key="client" className="flex flex-col">
              <span>{row.name}</span>
              <span>{row.email}</span>
            </span>,
            <span key="application" className="flex flex-col">
              <span>{row.visaTypeLabel}</span>
              <span>{row.applicationId}</span>
            </span>,
            row.stageLabel,
            row.nextAction,
            <ArrowLink key="open" href={`/admin/${row.clientId}`}>
              Open profile
            </ArrowLink>,
          ],
        }))}
      />

      <p className="px-2 text-sm text-foreground">
        Showing {rows.length} of {allRows.length} clients
      </p>
    </main>
  );
}
