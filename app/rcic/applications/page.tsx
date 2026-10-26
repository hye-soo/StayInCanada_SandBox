import Link from "next/link";
import { requireRole } from "@/lib/firebase/session.ts";
import { getAllClientSummaries, needsSubmissionRecording } from "@/lib/client-directory.ts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function RcicApplicationsPage() {
  await requireRole(["rcic"]);
  const clients = getAllClientSummaries().filter(
    (summary) =>
      needsSubmissionRecording(summary) || summary.submission.state === "submitted_to_ircc"
  );

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
        <Link href="/rcic" className="text-sm text-muted-foreground hover:underline">
          Back to overview
        </Link>
      </div>
      <p className="text-sm text-muted-foreground">
        Approved packages awaiting submission, and applications already submitted to IRCC.
      </p>

      {clients.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing here yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {clients.map((summary) => (
            <li key={summary.clientId}>
              <Card>
                <CardHeader>
                  <CardTitle>Client {summary.clientId}</CardTitle>
                  <CardDescription>
                    {summary.submission.state === "submitted_to_ircc"
                      ? `Submitted to IRCC • Reference ${summary.submission.record?.irccReference}`
                      : `Package v${summary.submission.package?.version} approved — ready to record submission`}
                  </CardDescription>
                </CardHeader>
                <CardContent />
                <CardFooter>
                  <Button
                    variant="outline"
                    render={<Link href={`/rcic/${summary.clientId}/validation`}>Open</Link>}
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
