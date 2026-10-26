import Link from "next/link";
import { requireRole } from "@/lib/firebase/session.ts";
import { getRcicOverviewStats, getNeedsAttentionRows } from "@/lib/client-directory.ts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function RcicOverviewPage() {
  await requireRole(["rcic"]);
  const stats = getRcicOverviewStats();
  // RCIC's slice of the same cross-client queue: only rows that are
  // actually RCIC's turn (Admin already forwarded, or a correction
  // RCIC itself requested).
  const rows = getNeedsAttentionRows().filter(
    (row) => row.owner === "RCIC" || row.owner === "Client"
  );

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Your workspace</h1>
        <p className="text-sm text-muted-foreground">
          RCIC overview • Final review, approvals and IRCC submission
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
            <CardTitle className="text-sm text-muted-foreground">Awaiting your review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.awaitingReview}</p>
            <p className="text-xs text-muted-foreground">Forwarded by Admin</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Changes requested</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.changesRequested}</p>
            <p className="text-xs text-muted-foreground">Waiting on the client</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Ready to submit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.readyToSubmit}</p>
            <p className="text-xs text-muted-foreground">Package approved, awaiting submission</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button render={<Link href="/rcic/clients">View all clients</Link>} />
        <Button variant="outline" render={<Link href="/rcic/final-reviews">Final reviews</Link>} />
        <Button variant="outline" render={<Link href="/rcic/applications">Applications</Link>} />
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
                    <Link href={`/rcic/${row.clientId}`} className="hover:underline">
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
          Review each document and the client&apos;s intake information. Approve what&apos;s
          ready, or request changes for anything missing. Once everything&apos;s approved, send
          the finished package to IRCC.
        </p>
      </div>
    </main>
  );
}
