import Link from "next/link";
import { requireRole } from "@/lib/firebase/session.ts";
import {
  getAllClientSummaries,
  needsRcicValidation,
  needsPackageApproval,
} from "@/lib/client-directory.ts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function RcicFinalReviewsPage() {
  await requireRole(["rcic"]);
  const clients = getAllClientSummaries().filter(
    (summary) => needsRcicValidation(summary) || needsPackageApproval(summary)
  );

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Final reviews</h1>
        <Link href="/rcic" className="text-sm text-muted-foreground hover:underline">
          Back to overview
        </Link>
      </div>
      <p className="text-sm text-muted-foreground">
        Clients waiting on requirements validation or final package approval.
      </p>

      {clients.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing is waiting on final review.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {clients.map((summary) => (
            <li key={summary.clientId}>
              <Card>
                <CardHeader>
                  <CardTitle>Client {summary.clientId}</CardTitle>
                  <CardDescription>
                    {needsRcicValidation(summary)
                      ? "Admin review complete — ready for your validation"
                      : `Package v${summary.submission.package?.version} ready for final approval`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {summary.checklistCounts.approved} of{" "}
                    {Object.values(summary.checklistCounts).reduce((a, b) => a + b, 0)} documents
                    approved
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    render={<Link href={`/rcic/${summary.clientId}/validation`}>Open review</Link>}
                  />
                </CardFooter>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
