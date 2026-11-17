import Link from "next/link";
import { cn } from "cn";
import { requireRole } from "@/lib/firebase/session.ts";
import { getAllClientSummaries, getClientQueueRows } from "@/lib/client-directory.ts";
import { getClientProfile } from "@/lib/client-profile.ts";
import { getClientIdentity } from "@/lib/client-identity.ts";
import { filterClientRows, paginate, type ClientListRow } from "@/lib/client-list.ts";
import { PageHeader } from "@/components/layouts/page-header";
import { DataTable } from "@/components/patterns/data-table";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

function buildRows(staffName: string | undefined): ClientListRow[] {
  const queue = new Map(getClientQueueRows().map((row) => [row.clientId, row]));
  return getAllClientSummaries().map((summary) => {
    const { name, email } = getClientIdentity(summary.clientId);
    const profile = getClientProfile(summary.clientId);
    const counts = summary.checklistCounts;
    return {
      clientId: summary.clientId,
      name,
      email,
      applicationId: profile.applicationId,
      applicationType: profile.applicationType,
      stageLabel: summary.stage.label,
      nextAction: queue.get(summary.clientId)?.nextAction ?? "—",
      needsAttention: counts.required + counts.changes_required + counts.submitted + counts.under_review > 0,
      assignedToMe: Boolean(staffName) && profile.assignedAdvisorName === staffName,
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
  const { displayName } = await requireRole(["admin"]);
  const params = await searchParams;
  const read = (name: string) => (typeof params[name] === "string" ? (params[name] as string) : "");
  const q = read("q");
  const applicationType = read("applicationType");
  const status = read("status");
  const assigned = read("assigned");

  const allRows = buildRows(displayName);
  const rows = filterClientRows(allRows, { q, applicationType, status, assigned });
  const { items: pageRows, page, pageCount } = paginate(rows, Number(read("page")) || 1);
  const assignedCount = filterClientRows(allRows, { assigned: "me" }).length;
  const applicationTypes = [...new Set(allRows.map((row) => row.applicationType))].sort();
  const query = (changes: Record<string, string>) => {
    const next = new URLSearchParams({ q, applicationType, status, assigned, ...changes });
    for (const [key, value] of [...next.entries()]) if (!value) next.delete(key);
    const text = next.toString();
    return text ? `/admin/clients?${text}` : "/admin/clients";
  };

  return (
    <main className="flex flex-col gap-5 pt-2 lg:pt-6">
      <PageHeader
        title="All clients"
        subtitle="Find client profiles, application types and cases requiring attention"
      />

      <form action="/admin/clients" className="flex flex-wrap items-end gap-3">
        {assigned ? <input type="hidden" name="assigned" value={assigned} /> : null}
        <div className="flex min-w-60 flex-[440] flex-col gap-2">
          <Label htmlFor="q">Search clients</Label>
          <Input id="q" name="q" defaultValue={q} placeholder="Name, email or application ID" />
        </div>
        <div className="flex min-w-48 flex-[280] flex-col gap-2">
          <Label htmlFor="applicationType">Application type</Label>
          <Select id="applicationType" name="applicationType" defaultValue={applicationType}>
            <option value="">All application types</option>
            {applicationTypes.map((type) => (
              <option key={type} value={type}>
                {type}
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
        <Chip href={query({ assigned: "", page: "" })} active={!assigned}>
          All clients ({allRows.length})
        </Chip>
        <Chip href={query({ assigned: "me", page: "" })} active={assigned === "me"}>
          Assigned to me ({assignedCount})
        </Chip>
      </div>

      <DataTable
        columns={["Client", "Application", "Stage", "Next action", "Action"]}
        emptyMessage="No clients match your search."
        rows={pageRows.map((row) => ({
          key: row.clientId,
          cells: [
            <span key="client" className="flex flex-col">
              <span>{row.name}</span>
              <span>{row.email}</span>
            </span>,
            <span key="application" className="flex flex-col">
              <span>{row.applicationType}</span>
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

      <div className="flex flex-wrap items-center justify-between gap-3 px-2 text-sm text-foreground">
        <p>
          Showing {pageRows.length} of {rows.length} clients • Page {page} of {pageCount}
        </p>
        {pageCount > 1 ? (
          <nav aria-label="Pages" className="flex gap-2">
            {page > 1 ? (
              <Link href={query({ page: String(page - 1) })} className="rounded-full border border-input px-4 py-1.5 font-semibold hover:bg-secondary">
                Previous
              </Link>
            ) : null}
            {page < pageCount ? (
              <Link href={query({ page: String(page + 1) })} className="rounded-full border border-input px-4 py-1.5 font-semibold hover:bg-secondary">
                Next
              </Link>
            ) : null}
          </nav>
        ) : null}
      </div>
    </main>
  );
}
