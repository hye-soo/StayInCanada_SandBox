import Link from "next/link";
import { getAllClientSummaries } from "@/lib/client-directory.ts";
import { ClientList } from "@/components/staff/client-list.tsx";
import { requireRole } from "@/lib/firebase/session.ts";

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireRole(["admin"]);
  const { q, status } = await searchParams;
  let clients = getAllClientSummaries();

  if (q) {
    const needle = q.toLowerCase();
    clients = clients.filter((client) => client.clientId.toLowerCase().includes(needle));
  }
  if (status === "needs_attention") {
    clients = clients.filter(
      (client) =>
        client.checklistCounts.required > 0 ||
        client.checklistCounts.changes_required > 0 ||
        client.checklistCounts.submitted > 0 ||
        client.checklistCounts.under_review > 0
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">All Clients</h1>
        <Link href="/admin" className="text-sm text-muted-foreground hover:underline">
          Back to overview
        </Link>
      </div>

      <form className="flex flex-wrap gap-2" action="/admin/clients">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by client ID"
          className="flex-1 rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
        >
          <option value="">All case statuses</option>
          <option value="needs_attention">Needs attention</option>
        </select>
        <button
          type="submit"
          className="rounded-lg border border-input px-3 py-2 text-sm hover:bg-muted"
        >
          Filter
        </button>
      </form>

      <ClientList
        clients={clients}
        basePath="/admin"
        highlightStatus="submitted"
        highlightLabel="awaiting your review"
      />
    </main>
  );
}
