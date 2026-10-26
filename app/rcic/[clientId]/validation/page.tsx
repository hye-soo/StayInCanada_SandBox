import Link from "next/link";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientChecklist } from "@/lib/client-checklist.ts";
import { getClientSummary, needsRcicValidation } from "@/lib/client-directory.ts";
import { getActivityLogStore } from "@/lib/activity-log-store.ts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  validateRequirements,
  returnWithChanges,
  approvePackage,
  returnPackageForCorrection,
  recordSubmission,
} from "./actions.ts";

export default async function RcicValidationPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole(["rcic"]);
  const { clientId } = await params;
  const { error } = await searchParams;
  const { items } = getClientChecklist(clientId);
  const summary = getClientSummary(clientId);
  const { submission } = summary;
  const internalFlag = items.find((item) => item.adminNote)?.adminNote;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {submission.state === "awaiting_validation" || submission.state === "validated"
            ? "RCIC requirements validation"
            : submission.state === "package_prepared"
              ? "Final application review"
              : submission.state === "approved_for_submission"
                ? "Record submission to IRCC"
                : "Submission recorded"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Client {clientId} • {summary.visaTypeLabel}
        </p>
        <Link href={`/rcic/${clientId}`} className="text-sm text-muted-foreground hover:underline">
          Back to client
        </Link>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {submission.state === "awaiting_validation" && !needsRcicValidation(summary) ? (
        <p className="text-sm text-muted-foreground">
          Not ready yet — every checklist item needs to be approved first.
        </p>
      ) : null}

      {submission.state === "awaiting_validation" && needsRcicValidation(summary) ? (
        <>
          <div className="rounded-[var(--radius-lg)] border border-border bg-muted/50 p-6">
            <h2 className="text-lg font-semibold">Ready for your validation</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Admin has checked completeness, readability and consistency. Review the intake and
              documents before moving the file to preparation.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Client information and documents</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                  {summary.questionnaireComplete} of {summary.questionnaireTotal} intake sections
                  complete • {summary.checklistCounts.approved} of {items.length} documents
                  approved
                </p>
                <ul className="flex flex-col gap-2 text-sm">
                  <li className="flex items-center justify-between rounded-[var(--radius-md)] border border-border p-2">
                    <span>Client intake</span>
                    <Link href={`/rcic/${clientId}/summary`} className="text-xs underline">
                      View intake
                    </Link>
                  </li>
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between rounded-[var(--radius-md)] border border-border p-2"
                    >
                      <span>{item.label}</span>
                      <Link href={`/checklist/${item.id}`} className="text-xs underline">
                        View file
                      </Link>
                    </li>
                  ))}
                </ul>
                {internalFlag ? (
                  <p className="text-xs text-muted-foreground">
                    <strong>Internal flag from Admin:</strong> {internalFlag}
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your validation decision</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <li>✓ Client information reviewed</li>
                  <li>✓ Required evidence verified</li>
                  <li>✓ Open issues resolved</li>
                </ul>
                <form action={validateRequirements.bind(null, clientId)} className="flex flex-col gap-2">
                  <Textarea name="note" placeholder="Review note" className="text-sm" />
                  <Button type="submit" className="self-start">
                    Validate &amp; hand off
                  </Button>
                </form>
                <form action={returnWithChanges.bind(null, clientId)} className="flex flex-col gap-2">
                  <Textarea name="note" placeholder="What needs to change?" className="text-sm" />
                  <Button type="submit" variant="outline" className="self-start">
                    Return with changes
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground">
                  This validates the requirements. The prepared application still needs your
                  final approval.
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}

      {submission.state === "validated" ? (
        <p className="text-sm text-muted-foreground">
          Requirements validated. Waiting on Admin to prepare the package.
        </p>
      ) : null}

      {submission.state === "package_prepared" ? (
        <>
          <div className="rounded-[var(--radius-lg)] border border-border bg-muted/50 p-6">
            <h2 className="text-lg font-semibold">Review the prepared application before approving</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Requirements were validated earlier. This review covers the final forms, evidence
              and file package that will be submitted.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Package v{submission.package?.version}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p>Prepared by {submission.package?.preparedBy}</p>
                <ul className="flex flex-col gap-2">
                  <li className="rounded-[var(--radius-md)] border border-border p-2">
                    Official application forms (mock preview, no real IRCC form generation)
                  </li>
                  <li className="rounded-[var(--radius-md)] border border-border p-2">
                    Supporting evidence — {summary.checklistCounts.approved} documents
                  </li>
                  <li className="rounded-[var(--radius-md)] border border-border p-2">
                    Client authorization (signed)
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>RCIC sign-off</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <li>✓ Forms and details checked</li>
                  <li>✓ Supporting evidence checked</li>
                  <li>✓ Signatures and authorization checked</li>
                </ul>
                <form action={approvePackage.bind(null, clientId)} className="flex flex-col gap-2">
                  <Textarea name="note" placeholder="Approval note" className="text-sm" />
                  <Button type="submit" className="self-start">
                    Approve for submission
                  </Button>
                </form>
                <form
                  action={returnPackageForCorrection.bind(null, clientId)}
                  className="flex flex-col gap-2"
                >
                  <Textarea name="note" placeholder="What needs correcting?" className="text-sm" />
                  <Button type="submit" variant="outline" className="self-start">
                    Return for correction
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}

      {submission.state === "approved_for_submission" ? (
        <>
          <div className="rounded-[var(--radius-lg)] border border-border bg-muted/50 p-6">
            <h2 className="text-lg font-semibold">Approved for submission</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Package v{submission.package?.version} was approved. Complete the submission through
              the appropriate IRCC account, then record the details here.
            </p>
          </div>

          <form
            action={recordSubmission.bind(null, clientId)}
            className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border p-6"
          >
            <label className="flex flex-col gap-1 text-sm">
              Submitted by
              <input
                type="text"
                name="submittedBy"
                className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
              />
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                Submission date
                <input
                  type="date"
                  name="submissionDate"
                  required
                  className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Submission channel
                <input
                  type="text"
                  name="channel"
                  required
                  placeholder="IRCC online account"
                  className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-sm">
              IRCC application reference
              <input
                type="text"
                name="irccReference"
                required
                className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Receipt / confirmation file name
              <input
                type="text"
                name="receiptFileName"
                placeholder="submission-confirmation.pdf"
                className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
              />
            </label>
            <Button type="submit" className="self-start">
              Save submission record
            </Button>
          </form>
        </>
      ) : null}

      {submission.state === "submitted_to_ircc" && submission.record ? (
        <>
          <div className="rounded-[var(--radius-lg)] border border-border bg-status-approved/20 p-6">
            <h2 className="text-lg font-semibold">Your submission record is saved</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Package v{submission.package?.version} • Reference {submission.record.irccReference}
            </p>
            <p className="text-sm text-muted-foreground">
              Recorded by {submission.record.submittedBy} on {submission.record.submissionDate}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Application activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2 text-sm">
                {getActivityLogStore()
                  .getForClient(clientId)
                  .map((entry, index) => (
                    <li key={index} className="flex justify-between gap-4 border-b border-border pb-2">
                      <span>{entry.message}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            Submission completes this product workflow. It does not mean the immigration
            application has been approved.
          </p>

          <div className="flex gap-2">
            <Button variant="outline" render={<Link href={`/rcic/${clientId}`}>Return to client profile</Link>} />
            <Button variant="outline" render={<Link href="/rcic">Back to workspace</Link>} />
          </div>
        </>
      ) : null}
    </main>
  );
}
