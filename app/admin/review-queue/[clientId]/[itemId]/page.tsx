import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, UserRound } from "lucide-react";
import { cn } from "cn";
import { documentVersion, getAiReviewStore, runAiCheck, type AiCheck, type FindingDecision } from "@/lib/ai-review.ts";
import { getChecklistStore } from "@/lib/checklist-store.ts";
import { getClientIdentity } from "@/lib/client-identity.ts";
import { getClientProfile } from "@/lib/client-profile.ts";
import { MOCK_USERS } from "@/lib/data/mock-users.ts";
import { requireRole } from "@/lib/firebase/session.ts";
import { getUploadedFileStore } from "@/lib/uploaded-file-store.ts";
import { AiCheckPill, AiPill } from "@/components/patterns/ai-check-pill";
import { RequestChangesDialog } from "@/components/patterns/request-changes-dialog";
import { DemoSwitchButton } from "@/app/demo/demo-switch-button";
import { startAiPassportDemo } from "@/app/demo/actions.ts";
import { approveDocument, decideFinding, sendChangeRequest } from "../../actions.ts";

// Figma "AI Review Assistant" buttons.
const PRIMARY =
  "flex h-[42px] min-w-[180px] items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90";
const SECONDARY =
  "flex h-[42px] min-w-[200px] items-center justify-center rounded-md border border-border bg-card px-6 text-sm font-semibold text-primary hover:bg-secondary";

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
  const isDemoClient = MOCK_USERS.some((user) => user.id === clientId);

  const header = (
    <header className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">Staff workspace / Review queue</p>
      <h1 className="text-[32px] font-bold leading-10 text-foreground">
        {replacement ? `Review replacement ${label}` : `Review ${label}`}
      </h1>
      <p className="text-base text-muted-foreground">
        {name} · {profile.applicationId} · {profile.applicationType}
      </p>
    </header>
  );
  const backToQueue = (
    <Link href="/admin/review-queue" className={SECONDARY}>
      Back to review queue
    </Link>
  );

  if (item.status === "changes_required") {
    return (
      <main className="flex flex-col gap-6 pt-2">
        {header}
        <OutcomeCard
          badge={<AiPill tone="amber">Changes requested</AiPill>}
          title="Correction request sent"
          line={`${firstName} can see your request on the ${label} requirement.`}
          next={`Next action: ${firstName} uploads a new ${label}.`}
        >
          {isDemoClient ? (
            <>
              <form action={startAiPassportDemo}>
                <button type="submit" className={SECONDARY}>
                  Demo · Restart
                </button>
              </form>
              <DemoSwitchButton role="client" next={`/checklist/${itemId}`} label="Demo · Open client request" className={PRIMARY} />
            </>
          ) : (
            backToQueue
          )}
        </OutcomeCard>
        <section className="flex flex-col gap-3 rounded-xl border border-border bg-card px-6 py-6">
          <h2 className="text-base font-semibold text-foreground">Message sent to {firstName}</h2>
          <p className="text-[15px] text-foreground">{item.staffComment}</p>
        </section>
      </main>
    );
  }

  if (item.status === "approved") {
    const approval = getAiReviewStore().getApproval(clientId, itemId);
    return (
      <main className="flex flex-col gap-6 pt-2">
        {header}
        <OutcomeCard
          badge={<AiPill tone="green">Approved</AiPill>}
          title={`${item.label} approved`}
          line={`${approval?.by.split(" ")[0] ?? "Staff"} approved ${label} v${version} after reviewing ${replacement ? "the replacement" : "the file"}.`}
          next={`The case team can use this document to prepare ${firstName}’s application.`}
        >
          {backToQueue}
          {isDemoClient ? (
            <DemoSwitchButton role="client" next={`/checklist/${itemId}`} label="Demo · Open client result" className={PRIMARY} />
          ) : null}
        </OutcomeCard>
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
        <div>{backToQueue}</div>
      </main>
    );
  }

  const issue = check.status === "issue";
  const openIssue = issue && !decision;
  // Once the finding is settled (or there is none), staff approve or ask
  // for changes from the bottom row (Figma 10).
  const canDecide = !issue || decision === "dismissed";
  const requestDialog = (triggerLabel: string, triggerClassName: string) => (
    <RequestChangesDialog
      clientFirstName={firstName}
      requirement={`${name} · ${item.label} / v${version}`}
      draft={check.draftMessage}
      action={sendChangeRequest.bind(null, clientId, itemId)}
      triggerLabel={triggerLabel}
      triggerClassName={triggerClassName}
    />
  );

  return (
    <main className="flex flex-col gap-6 pt-2">
      {header}

      <div className={cn("grid grid-cols-1 gap-6", replacement ? "xl:grid-cols-[1fr_1fr_380px]" : "xl:grid-cols-[minmax(0,1fr)_450px]")}>
        {replacement && item.previousUpload ? (
          <PreviewCard
            heading="Original submission · v1"
            fileName={item.previousUpload.fileName}
            itemId={itemId}
            clientName={name}
            cropped
            highlight
            caption={itemId === "passport" ? "The preview ends before the expiry date is fully visible." : undefined}
          />
        ) : null}
        <PreviewCard
          heading={replacement ? `Replacement · v${version}` : "Original submission · v1"}
          fileName={item.fileName}
          itemId={itemId}
          clientName={name}
          cropped={issue}
          highlight={issue && decision !== "dismissed"}
          caption={
            issue
              ? "The preview ends before the expiry date is fully visible."
              : itemId === "passport"
                ? "The expiry date and full photo page are visible."
                : undefined
          }
          fileHref={hasFile ? `/admin/review-queue/${clientId}/${itemId}/file` : undefined}
        />

        <aside className="flex flex-col gap-5 self-stretch rounded-xl border border-border bg-card p-6">
          <AiPill tone="blue" className="min-w-0 self-start">
            Internal · Staff only
          </AiPill>
          <div className="flex flex-col gap-3 border-b border-border pb-5">
            <h2 className="text-xl font-semibold text-foreground">AI review findings</h2>
            <div>
              <AiCheckPill check={check} decision={decision} />
            </div>
          </div>

          <Findings check={check} decision={decision} />

          {check.intakeComparison ? (
            <div className="flex flex-col gap-1.5">
              <p className={cn("font-semibold text-foreground", issue ? "text-sm" : "text-base")}>Intake comparison</p>
              <p className={issue ? "text-sm text-muted-foreground" : "text-base text-foreground"}>{check.intakeComparison}</p>
            </div>
          ) : null}

          {canDecide ? (
            <div className="mt-auto flex flex-col gap-1 rounded-md bg-secondary px-4 py-3">
              <p className="text-sm font-semibold">Awaiting staff review</p>
              <p className="text-xs text-muted-foreground">
                {replacement ? "Verify the replacement before approving." : "Check the file before approving."}
              </p>
            </div>
          ) : null}

          {openIssue ? (
            <div className="mt-auto flex flex-wrap gap-3">
              <form action={decideFinding.bind(null, clientId, itemId, "confirmed")} className="flex-1">
                <button type="submit" className={cn(PRIMARY, "w-full min-w-0")}>
                  Confirm issue
                </button>
              </form>
              <form action={decideFinding.bind(null, clientId, itemId, "dismissed")} className="flex-1">
                <button type="submit" className={cn(SECONDARY, "w-full min-w-0")}>
                  Dismiss finding
                </button>
              </form>
            </div>
          ) : decision === "confirmed" ? (
            <div className="mt-auto">{requestDialog("Review draft request", PRIMARY)}</div>
          ) : decision === "dismissed" ? (
            <form action={decideFinding.bind(null, clientId, itemId, "reopen")}>
              <button type="submit" className={PRIMARY}>
                Reopen finding
              </button>
            </form>
          ) : null}
        </aside>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {backToQueue}
        {canDecide ? (
          <div className="flex flex-wrap gap-3">
            {requestDialog("Request changes", SECONDARY)}
            <form action={approveDocument.bind(null, clientId, itemId)}>
              <button type="submit" className={PRIMARY}>
                Approve document
              </button>
            </form>
          </div>
        ) : null}
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        {canDecide ? "Staff decide whether to approve this document." : "Review the source document before taking action on AI findings."}
      </p>
    </main>
  );
}

function Findings({ check, decision }: { check: AiCheck; decision?: FindingDecision }) {
  if (check.status === "checking") {
    return <p className="text-base text-foreground">The AI check is still running. You can review the file yourself in the meantime.</p>;
  }
  if (check.status === "failed") {
    return <p className="text-base text-foreground">The AI couldn&apos;t read this file. Check it yourself before deciding.</p>;
  }
  if (check.status === "clean") {
    return (
      <div className="flex flex-col gap-1.5">
        <p className="text-base font-semibold text-foreground">{check.resolved ? "Previously flagged area" : "No problems found"}</p>
        <p className="text-base text-foreground">{check.resolved ?? "Check the file before approving."}</p>
      </div>
    );
  }
  if (decision === "dismissed") {
    return (
      <div className="flex flex-col gap-1.5">
        <p className="text-base font-semibold text-foreground">Finding dismissed</p>
        <p className="text-base text-foreground">Staff can still inspect the original and decide whether to request changes.</p>
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-5">
      {check.findings.map((finding) => (
        <li key={finding.title} className="flex flex-col gap-3">
          <p className="text-base font-semibold text-foreground">{decision === "confirmed" ? "Issue confirmed by staff" : finding.title}</p>
          <p className="text-base text-foreground">{finding.detail}</p>
          <div className="flex flex-col gap-1 rounded-md bg-peach px-4 py-3">
            <p className="text-sm font-semibold text-[#8a5000]">{finding.page}</p>
            <p className="text-xs text-[#8a5000]/80">{finding.field}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function OutcomeCard({
  badge,
  title,
  line,
  next,
  children,
}: {
  badge: React.ReactNode;
  title: string;
  line: string;
  next: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-card px-6 py-6">
      <div>{badge}</div>
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="flex flex-col gap-3">
        <p className="text-[15px] text-foreground">{line}</p>
        <p className="text-[15px] text-muted-foreground">{next}</p>
      </div>
      {children ? <div className="mt-2 flex flex-wrap gap-3">{children}</div> : null}
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
    <section className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-start justify-between gap-2 border-b border-border px-6 py-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">{heading}</h2>
          <p className="text-xs text-muted-foreground">{fileName} · Page 1 of 1</p>
        </div>
        {fileHref ? (
          <a href={fileHref} target="_blank" rel="noopener" className="text-sm font-semibold text-primary hover:underline">
            Open file
          </a>
        ) : null}
      </div>

      <div className="flex flex-col gap-6 px-6 py-6">
        {itemId === "passport" ? (
          <div className="overflow-hidden rounded-md border border-border bg-card">
            <div className={cn("px-4 pt-4", cropped ? "h-[195px] overflow-hidden" : "pb-3")}>
              <p className="border-b border-border pb-3 text-xs tracking-wide text-muted-foreground">SAMPLE / PASSPORT PHOTO PAGE</p>
              <div className="mt-4 flex gap-4">
                <div className="flex size-[78px] shrink-0 items-center justify-center rounded-sm bg-[#d9e4ec]" aria-hidden>
                  <UserRound className="size-12 fill-[#a9bfcc] text-[#a9bfcc]" />
                </div>
                <dl className="flex min-w-0 flex-1 flex-col gap-2 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">SURNAME / GIVEN NAME</dt>
                    <dd className="font-semibold">
                      {rest.join(" ") || given} / {given}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">DATE OF BIRTH</dt>
                    <dd className="font-semibold">14 MAY 2007</dd>
                  </div>
                  <div className={cn("-mx-1.5 rounded-sm px-1.5 py-1", highlight && "border border-[#e9a23b] bg-peach/60")}>
                    <dt className="text-xs text-muted-foreground">EXPIRY DATE</dt>
                    <dd className="font-semibold">{cropped ? "24 JUN" : "24 JUN 2031"}</dd>
                  </div>
                </dl>
              </div>
              {cropped ? null : (
                <p className="mt-3 border-t border-border pt-2 text-[11px] tracking-wide text-muted-foreground">
                  ILLUSTRATIVE FILE · NO REAL PASSPORT DATA
                </p>
              )}
            </div>
            {cropped ? <div className="h-[46px] bg-[#e1e8ee]" aria-hidden /> : null}
          </div>
        ) : (
          <div className="flex h-[230px] flex-col items-center justify-center gap-2 rounded-md border border-border bg-muted">
            <FileText className="size-10 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">{fileName}</p>
          </div>
        )}
        {caption ? <p className="text-sm text-muted-foreground">{caption}</p> : null}
      </div>
    </section>
  );
}
