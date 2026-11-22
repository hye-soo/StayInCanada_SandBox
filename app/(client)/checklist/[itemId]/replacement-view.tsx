import Link from "next/link";
import { getAiReviewStore } from "@/lib/ai-review.ts";
import { getMemoStore } from "@/lib/memo-store.ts";
import type { ChecklistItem } from "@/lib/types.ts";
import { AiPill } from "@/components/patterns/ai-check-pill";
import { UploadReplacementDialog } from "@/components/patterns/upload-replacement-dialog";
import { DemoSwitchButton } from "@/app/demo/demo-switch-button";
import { startAiPassportDemo } from "@/app/demo/actions.ts";
import { uploadMockFile } from "./actions.ts";

const PRIMARY =
  "flex h-[42px] w-[260px] items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90";
const SECONDARY =
  "flex h-[42px] items-center justify-center rounded-md border border-border bg-card px-6 text-sm font-semibold text-primary hover:bg-secondary";

// Figma "AI Review Assistant" 06-08 and 12: the client's side of a
// change request: what the team asked for, the replacement upload, and
// the result.
export function ReplacementView({
  uid,
  clientName,
  application,
  item,
  fileHref,
  error,
}: {
  uid: string;
  clientName: string;
  // e.g. "FO-2026-014 · Study permit"
  application: string;
  item: ChecklistItem;
  fileHref?: string;
  error?: string;
}) {
  const label = item.label.toLowerCase();
  const demo = item.id === "passport";
  const changeMemo = getMemoStore()
    .list(uid)
    .find((memo) => memo.startedBy === "staff" && memo.related.href === `/checklist/${item.id}`);
  const staffMessage = changeMemo ? [...changeMemo.messages].reverse().find((message) => message.from === "staff") : undefined;
  const approver = getAiReviewStore().getApproval(uid, item.id)?.by.split(" ")[0];

  const pill =
    item.status === "changes_required" ? (
      <AiPill tone="amber">Changes required</AiPill>
    ) : item.status === "approved" ? (
      <AiPill tone="green">Approved</AiPill>
    ) : (
      <AiPill tone="blue">Submitted</AiPill>
    );

  return (
    <main className="flex flex-col gap-6 pt-2">
      <header className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">
          Client workspace /{" "}
          <Link href="/checklist" className="hover:text-foreground hover:underline">
            Document checklist
          </Link>
        </p>
        <h1 className="text-[32px] font-bold leading-10 text-foreground">Document checklist</h1>
        <p className="text-base text-muted-foreground">
          {clientName} · {application}
        </p>
      </header>

      <section className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-card px-6 py-6">
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-foreground">{item.label}</h2>
          <div>{pill}</div>
          <p className="text-xs text-muted-foreground">
            Current file ·{" "}
            {fileHref ? (
              <a href={fileHref} target="_blank" rel="noopener noreferrer" className="hover:text-foreground hover:underline">
                {item.fileName}
              </a>
            ) : (
              item.fileName
            )}
          </p>
        </div>
        {item.status === "changes_required" ? (
          <div className="flex flex-col items-end gap-2">
            <UploadReplacementDialog action={uploadMockFile.bind(null, item.id)} itemLabel={item.label} initialError={error} />
          </div>
        ) : item.status === "submitted" && demo ? (
          <DemoSwitchButton role="admin" next={`/admin/review-queue/${uid}/${item.id}`} label="Demo · Switch to staff" className={PRIMARY} />
        ) : null}
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card px-6 py-6">
        {item.status === "changes_required" ? (
          <>
            <h2 className="text-base font-semibold text-foreground">
              Message from {staffMessage?.authorName ?? "your case team"} · Case coordinator
            </h2>
            <p className="text-[15px] text-foreground">{staffMessage?.body ?? item.staffComment}</p>
            <p className="text-[15px] text-muted-foreground">Next action: upload a new {label}.</p>
          </>
        ) : item.status === "approved" ? (
          <>
            <h2 className="text-xl font-semibold text-foreground">Your {label} document is approved</h2>
            <p className="text-[15px] text-foreground">
              {approver ?? "Your case team"} has approved your {item.previousUpload ? "replacement" : "document"}.
            </p>
            <p className="text-[15px] text-muted-foreground">Next action: your case team continues preparing your application.</p>
            {demo ? (
              <form action={startAiPassportDemo} className="mt-2">
                <button type="submit" className={`${SECONDARY} w-[160px]`}>
                  Demo · Restart
                </button>
              </form>
            ) : null}
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-foreground">Replacement submitted</h2>
            <p className="text-[15px] text-foreground">Your case team will review the updated {label}.</p>
            <p className="text-[15px] text-muted-foreground">Next action: your case team reviews your file.</p>
          </>
        )}
      </section>
    </main>
  );
}
