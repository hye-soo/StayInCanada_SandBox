import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, FileText, Lock, Sparkles } from "lucide-react";
import { cn } from "cn";
import { aiCheckLabel, documentVersion, getAiReviewStore, runAiCheck, type AiCheck } from "@/lib/ai-review.ts";
import { getChecklistStore } from "@/lib/checklist-store.ts";
import { getClientIdentity } from "@/lib/client-identity.ts";
import { getClientProfile } from "@/lib/client-profile.ts";
import { requireRole } from "@/lib/firebase/session.ts";
import { getUploadedFileStore } from "@/lib/uploaded-file-store.ts";
import { StatusPill } from "@/components/patterns/status-pill";
import { RequestChangesDialog } from "@/components/patterns/request-changes-dialog";
import { BackLink } from "@/components/ui/back-link";
import { FEED_OUTLINE, FEED_PRIMARY } from "@/components/patterns/memo-thread-card";
import { DemoSwitchButton } from "@/app/demo/demo-switch-button";
import { approveDocument, decideFinding, sendChangeRequest } from "../../actions.ts";

// Figma "AI Review Assistant" 02-05, 10, 11, 13: one submitted document,
// its AI findings (staff only) and the staff decision.
export default async function DocumentReviewPage({ params }: PageProps<"/admin/review-queue/[clientId]/[itemId]">) {
  await requireRole(["admin"]);
  const { clientId, itemId } = await params;
  const store = getChecklistStore();
  const item = store.getAllClientIds().includes(clientId) ? store.getItem(clientId, itemId) : undefined;
  if (!item) notFound();

  const { name } = getClientIdentity(clientId);
  const firstName = name.split(" ")[0] ?? name;
  const profile = getClientProfile(clientId);
  const version = documentVersion(item);
  const replacement = version > 1;
  const label = item.label.toLowerCase();
  const check = runAiCheck(clientId, item);
  const decision = item.fileName ? getAiReviewStore().getDecision(clientId, itemId, item.fileName) : undefined;
  const hasFile = Boolean(getUploadedFileStore().get(clientId, itemId));

  const header = (
    <header className="flex flex-col gap-2">
      <BackLink href="/admin/review-queue">Review queue</BackLink>
      <p className="text-sm text-muted-foreground">Staff workspace / Review queue</p>
      <h1 className="text-[32px] font-bold leading-10 text-foreground">
        {replacement ? `Review replacement ${label}` : `Review ${label}`}
      </h1>
      <p className="text-base text-muted-foreground">
        {name} · {profile.applicationId} · {profile.applicationType}
      </p>
    </header>
  );

  if (item.status === "changes_required") {
    return (
      <main className="flex flex-col gap-6 pt-2">
        {header}
        <OutcomeCard
          tone="changes"
          badge="Changes requested"
          title="Correction request sent"
          lines={[
            `${firstName} can see your request on the ${label} requirement.`,
            `Next action: ${firstName} uploads a new file.`,
          ]}
        >
          <div className="flex flex-col gap-1 rounded-lg bg-secondary px-4 py-3">
            <p className="text-sm font-semibold">Message sent to {firstName}</p>
            <p className="text-sm">{item.staffComment}</p>
          </div>
        </OutcomeCard>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/review-queue" className={cn(FEED_PRIMARY, "w-[220px]")}>
            Back to review queue
          </Link>
          <DemoSwitchButton role="client" next={`/checklist/${itemId}`} label="Demo · Open client request" />
        </div>
      </main>
    );
  }

  if (item.status === "approved") {
    const approval = getAiReviewStore().getApproval(clientId, itemId);
    return (
      <main className="flex flex-col gap-6 pt-2">
        {header}
        <OutcomeCard
          tone="approved"
          badge="Approved"
          title={`${item.label} approved`}
          lines={[
            `${approval?.by ?? "Staff"} approved ${label} v${version} after reviewing ${replacement ? "the replacement" : "the file"}.`,
            `The case team can use this document to prepare ${firstName}’s application.`,
          ]}
        />
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/review-queue" className={cn(FEED_PRIMARY, "w-[220px]")}>
            Back to review queue
          </Link>
          <DemoSwitchButton role="client" next={`/checklist/${itemId}`} label="Demo · Open client result" />
        </div>
      </main>
    );
  }

  if (item.status !== "submitted" || !item.fileName) {
    return (
      <main className="flex flex-col gap-6 pt-2">
        {header}
        <p className="rounded-xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
          Nothing to review here right now.{" "}
          <Link href={`/admin/${clientId}/checklist`} className="font-semibold text-primary">
            Open {firstName}&apos;s checklist
          </Link>
        </p>
      </main>
    );
  }

  const openIssue = check.status === "issue" && !decision;
  const fileHref = `/admin/review-queue/${clientId}/${itemId}/file`;

  return (
    <main className="flex flex-col gap-6 pt-2">
      {header}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className={cn("grid grid-cols-1 gap-6", replacement && "lg:grid-cols-2")}>
          {replacement && item.previousUpload ? (
            <PreviewCard
              heading="Original submission · v1"
              fileName={item.previousUpload.fileName}
              itemId={itemId}
              clientName={name}
              cropped
              highlight={false}
              caption={itemId === "passport" ? "The preview ends before the expiry date is fully visible." : undefined}
            />
          ) : null}
          <PreviewCard
            heading={replacement ? `Replacement · v${version}` : "Original submission · v1"}
            fileName={item.fileName}
            itemId={itemId}
            clientName={name}
            cropped={check.status === "issue"}
            highlight={check.status === "issue" && decision !== "dismissed"}
            caption={
              check.status === "issue"
                ? "The preview ends before the expiry date is fully visible."
                : itemId === "passport"
                  ? "The expiry date and full photo page are visible."
                  : undefined
            }
            fileHref={hasFile ? fileHref : undefined}
          />
        </div>

        <aside className="flex flex-col gap-4 self-start rounded-xl border border-border bg-card p-6">
          <span className="flex items-center gap-1.5 self-start rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <Lock className="size-3" aria-hidden />
            Internal · Staff only
          </span>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
              <Sparkles className="size-5 text-primary" aria-hidden />
              AI review findings
            </h2>
            <AiCheckPill check={check} decision={decision} />
          </div>

          <Findings check={check} decision={decision} />

          {check.intakeComparison ? (
            <div className="flex flex-col gap-1 rounded-lg border border-border px-4 py-3">
              <p className="text-sm font-semibold">Intake comparison</p>
              <p className="text-sm text-foreground">{check.intakeComparison}</p>
            </div>
          ) : null}

          {check.status !== "issue" || decision === "dismissed" ? (
            <div className="flex flex-col gap-1 rounded-lg bg-secondary px-4 py-3">
              <p className="text-sm font-semibold">Awaiting staff review</p>
              <p className="text-sm">{replacement ? "Verify the replacement before approving." : "Check the file before approving."}</p>
            </div>
          ) : null}

          <div className="flex flex-col gap-3">
            {openIssue ? (
              <>
                <form action={decideFinding.bind(null, clientId, itemId, "confirmed")}>
                  <button type="submit" className={cn(FEED_PRIMARY, "w-full")}>
                    Confirm issue
                  </button>
                </form>
                <form action={decideFinding.bind(null, clientId, itemId, "dismissed")}>
                  <button type="submit" className={cn(FEED_OUTLINE, "w-full")}>
                    Dismiss finding
                  </button>
                </form>
              </>
            ) : decision === "confirmed" ? (
              <RequestChangesDialog
                clientFirstName={firstName}
                requirement={`${name} · ${item.label} / v${version}`}
                draft={check.draftMessage}
                action={sendChangeRequest.bind(null, clientId, itemId)}
                triggerLabel="Review draft request"
                triggerClassName={cn(FEED_PRIMARY, "w-full")}
              />
            ) : (
              <>
                <form action={approveDocument.bind(null, clientId, itemId)}>
                  <button type="submit" className={cn(FEED_PRIMARY, "w-full")}>
                    Approve document
                  </button>
                </form>
                <RequestChangesDialog
                  clientFirstName={firstName}
                  requirement={`${name} · ${item.label} / v${version}`}
                  draft={check.draftMessage}
                  action={sendChangeRequest.bind(null, clientId, itemId)}
                  triggerLabel="Request changes"
                  triggerClassName={cn(FEED_OUTLINE, "w-full")}
                />
              </>
            )}
          </div>
        </aside>
      </div>

      <p className="text-sm text-muted-foreground">
        {openIssue || decision === "confirmed"
          ? "Review the source document before taking action on AI findings."
          : "Staff decide whether to approve this document."}
      </p>
    </main>
  );
}

function AiCheckPill({ check, decision }: { check: AiCheck; decision?: "confirmed" | "dismissed" }) {
  if (decision === "confirmed") return <StatusPill tone="alert">Confirmed by staff</StatusPill>;
  if (decision === "dismissed") return <StatusPill tone="muted">Dismissed</StatusPill>;
  return (
    <StatusPill tone={check.status === "issue" ? "alert" : check.status === "clean" ? "filled" : "muted"}>
      {aiCheckLabel(check)}
    </StatusPill>
  );
}

function Findings({ check, decision }: { check: AiCheck; decision?: "confirmed" | "dismissed" }) {
  if (check.status === "checking") {
    return <p className="text-sm text-muted-foreground">The AI check is still running. You can review the file yourself in the meantime.</p>;
  }
  if (check.status === "failed") {
    return <p className="text-sm text-muted-foreground">The AI couldn&apos;t read this file. Check it yourself before deciding.</p>;
  }
  if (check.status === "clean") {
    return check.resolved ? (
      <div className="flex flex-col gap-1 rounded-lg border border-border px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Check className="size-4 text-primary" strokeWidth={3} aria-hidden />
          Previously flagged area
        </p>
        <p className="text-sm">{check.resolved}</p>
      </div>
    ) : (
      <p className="text-sm text-muted-foreground">No problems found. Check the file before approving.</p>
    );
  }
  if (decision === "dismissed") {
    return (
      <div className="flex flex-col gap-1 rounded-lg border border-border px-4 py-3">
        <p className="text-sm font-semibold">Finding dismissed</p>
        <p className="text-sm">Staff can still inspect the original and decide whether to request changes.</p>
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-3">
      {check.findings.map((finding) => (
        <li key={finding.title} className="flex flex-col gap-2 rounded-lg border border-coral bg-card px-4 py-3">
          <p className="text-sm font-semibold">{decision === "confirmed" ? "Issue confirmed by staff" : finding.title}</p>
          <p className="text-sm">{finding.detail}</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-muted px-2.5 py-0.5">{finding.page}</span>
            <span className="rounded-full bg-muted px-2.5 py-0.5">{finding.field}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function OutcomeCard({
  tone,
  badge,
  title,
  lines,
  children,
}: {
  tone: "changes" | "approved";
  badge: string;
  title: string;
  lines: string[];
  children?: React.ReactNode;
}) {
  return (
    <section className="flex max-w-3xl flex-col gap-3 rounded-xl border border-border bg-card p-6">
      <span
        className={cn(
          "self-start rounded-full px-3 py-1 text-xs font-semibold",
          tone === "approved" ? "bg-lime-soft text-foreground" : "bg-peach text-foreground"
        )}
      >
        {badge}
      </span>
      <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      {lines.map((line) => (
        <p key={line} className="text-[15px] text-foreground">
          {line}
        </p>
      ))}
      {children}
    </section>
  );
}

// Illustrative passport page (no real passport data), or a plain file
// card for other documents. The flagged area is outlined on v1.
function PreviewCard({
  heading,
  fileName,
  itemId,
  clientName,
  cropped,
  highlight,
  caption,
  fileHref,
}: {
  heading: string;
  fileName: string;
  itemId: string;
  clientName: string;
  cropped: boolean;
  highlight: boolean;
  caption?: string;
  fileHref?: string;
}) {
  const [given = "", ...rest] = clientName.toUpperCase().split(" ");
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-foreground">{heading}</h2>
        {fileHref ? (
          <a href={fileHref} target="_blank" rel="noopener" className="text-sm font-semibold text-primary">
            Open file
          </a>
        ) : null}
      </div>
      <p className="-mt-2 text-sm text-muted-foreground">{fileName} · Page 1 of 1</p>

      {itemId === "passport" ? (
        <div className={cn("relative overflow-hidden rounded-lg border border-border bg-muted p-5", cropped ? "h-[230px]" : "")}>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground">SAMPLE / PASSPORT PHOTO PAGE</p>
          <div className="mt-4 flex gap-5">
            <div className="h-[120px] w-[96px] shrink-0 rounded-md bg-card" aria-hidden />
            <dl className="flex flex-col gap-3 text-sm">
              <div>
                <dt className="text-[11px] text-muted-foreground">SURNAME / GIVEN NAME</dt>
                <dd className="font-semibold">
                  {rest.join(" ") || given} / {given}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted-foreground">DATE OF BIRTH</dt>
                <dd className="font-semibold">14 MAY 2007</dd>
              </div>
              <div
                className={cn(
                  "rounded-md",
                  highlight && "-m-1.5 border-2 border-dashed border-coral bg-coral/10 p-1.5"
                )}
              >
                <dt className="text-[11px] text-muted-foreground">EXPIRY DATE</dt>
                <dd className="font-semibold">{cropped ? "24 JUN…" : "24 JUN 2031"}</dd>
              </div>
            </dl>
          </div>
          {cropped ? null : (
            <p className="mt-5 text-[11px] tracking-wide text-muted-foreground">ILLUSTRATIVE FILE · NO REAL PASSPORT DATA</p>
          )}
        </div>
      ) : (
        <div className="flex h-[230px] flex-col items-center justify-center gap-2 rounded-lg border border-border bg-muted">
          <FileText className="size-10 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">{fileName}</p>
        </div>
      )}
      {caption ? <p className="text-sm text-muted-foreground">{caption}</p> : null}
    </section>
  );
}
