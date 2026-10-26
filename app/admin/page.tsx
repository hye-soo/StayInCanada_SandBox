import { getAllClientSummaries } from "@/lib/client-directory.ts";
import { ClientList } from "@/components/staff/client-list.tsx";
import { requireRole } from "@/lib/firebase/session.ts";

export default async function AdminPage() {
  await requireRole(["admin"]);
  const clients = getAllClientSummaries();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">All Clients</h1>
      <ClientList
        clients={clients}
        basePath="/admin"
        highlightStatus="submitted"
        highlightLabel="awaiting your review"
      />
    </main>
  );
}
