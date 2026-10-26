import Link from "next/link";
import { requireRole } from "@/lib/firebase/session.ts";
import { getAdminOverviewStats, getNeedsAttentionRows } from "@/lib/client-directory.ts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminOverviewPage() {
  await requireRole(["admin"]);
  const stats = getAdminOverviewStats();
  const rows = getNeedsAttentionRows();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Your workspace</h1>
        <p className="text-sm text-muted-foreground">
          Admin overview • Client work, submissions and follow-ups
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Active clients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.activeClients}</p>
            <p className="text-xs text-muted-foreground">Across assigned applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Submitted items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.submittedItems}</p>
            <p className="text-xs text-muted-foreground">Waiting for a quality check</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Client follow-ups</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.clientFollowUps}</p>
            <p className="text-xs text-muted-foreground">Missing or changed items</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Ready for RCIC</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.readyForRcic}</p>
            <p className="text-xs text-muted-foreground">Admin review completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button render={<Link href="/admin/invitations">Invite a client</Link>} />
        <Button variant="outline" render={<Link href="/admin/clients">View all clients</Link>} />
        <Button
          variant="outline"
          render={<Link href="/admin/clients?status=needs_attention">Review submissions</Link>}
        />
      </div>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Client</th>
              <th className="p-3 font-medium">Needs attention</th>
              <th className="p-3 font-medium">Owner</th>
              <th className="p-3 font-medium">Open</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="p-3 text-muted-foreground" colSpan={4}>
                  Nothing needs attention right now.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={`${row.clientId}-${index}`} className="border-t border-border">
                  <td className="p-3">Client {row.clientId}</td>
                  <td className="p-3">
                    {row.itemLabel} · {row.statusLabel}
                  </td>
                  <td className="p-3">{row.owner}</td>
                  <td className="p-3">
                    <Link href={`/admin/${row.clientId}`} className="hover:underline">
                      Open profile
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-border bg-muted/50 p-6">
        <h2 className="text-lg font-semibold">Your next handoff</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Check readability and completeness, flag any issues, then notify the RCIC when the file
          is ready for validation.
        </p>
      </div>
    </main>
  );
}
