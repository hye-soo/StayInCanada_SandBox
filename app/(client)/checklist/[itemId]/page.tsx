import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "cn";
import { getClientChecklistItem } from "@/lib/client-checklist.ts";
import { getDocumentGuidance } from "@/lib/data/document-guidance.ts";
import { requireRole } from "@/lib/firebase/session.ts";
import { CLIENT_STATUS } from "@/lib/status-display.ts";
import type { ChecklistItemStatus } from "@/lib/types.ts";
import { DocumentUploadForm, FileCard } from "@/components/patterns/document-upload-form";
import { formatFileSize } from "@/lib/upload-validation.ts";
import { uploadMockFile } from "./actions.ts";
import { ReplacementView } from "./replacement-view";
import { getClientProfileStore } from "@/lib/client-profile-store.ts";
import { DemoSwitchButton } from "@/app/demo/demo-switch-button";
import { BackLink } from "@/components/ui/back-link";
import { getUploadedFileStore } from "@/lib/uploaded-file-store.ts";

const STATUS_PILL: Record<ChecklistItemStatus, string> = {
  required: "bg-sky-soft text-navy",
  changes_required: "bg-peach text-foreground",
  submitted: "bg-sky-tint text-primary",
  under_review: "bg-sky-tint text-primary",
  approved: "bg-lime-soft text-navy",
};

const FILE_BADGE: Partial<Record<ChecklistItemStatus, string>> = {
  submitted: "Submitted for review",
  under_review: "In review",
  approved: "Completed",
};

function Card({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("flex flex-col gap-4 rounded-xl border border-border bg-card p-6", className)}>
      {title ? <h2 className="text-lg font-semibold text-foreground">{title}</h2> : null}
      {children}
    </section>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3 text-sm text-foreground">
      {items.map((text) => (
        <li key={text} className="flex gap-3">
          <Check className="mt-0.5 size-3.5 shrink-0 text-primary" strokeWidth={3} aria-hidden />
          {text}
        </li>
      ))}
    </ul>
  );
}

// Figma "Upload flow" 01-05 for one checklist document.
export default async function ChecklistItemPage({ params, searchParams }: PageProps<"/checklist/[itemId]">) {
  const { uid, displayName } = await requireRole(["client"]);
  const { itemId } = await params;
  const { error, submitted } = await searchParams;
  const item = getClientChecklistItem(uid, itemId);
  if (!item) notFound();

  const guidance = getDocumentGuidance(item.id);
  const previousFileHref = getUploadedFileStore().get(uid, item.id) ? `/checklist/${item.id}/file` : undefined;

  // Figma "AI Review Assistant" 06-08, 12: changes requested, a submitted
  // replacement, and approved. A first upload keeps the Upload flow below.
  if (item.status === "changes_required" || item.status === "approved" || (item.status === "submitted" && item.previousUpload)) {
    const profile = getClientProfileStore().getProfile(uid);
    return (
      <ReplacementView
        uid={uid}
        clientName={displayName ?? "You"}
        application={`${profile.applicationId} \u00b7 ${profile.applicationType}`}
        item={item}
        fileHref={previousFileHref}
        error={typeof error === "string" ? error : undefined}
      />
    );
  }

  // From here: a first upload (Figma "Upload flow"), or the first file
  // waiting for review.
  const canUpload = item.status === "required";
  const justSubmitted = submitted === "1" && item.status === "submitted";

  return (
    <main className="flex flex-col gap-6 pt-2">
      <header className="flex flex-col gap-2">
        <BackLink href="/checklist">Document checklist</BackLink>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[28px] font-semibold text-foreground">{item.label}</h1>
          <span className={cn("rounded-full px-4 py-1 text-xs font-medium", STATUS_PILL[item.status])}>
            {CLIENT_STATUS[item.status].label}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{guidance.hint}</p>
      </header>


      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,410px)]">
        <Card className="min-h-[440px]">
          {canUpload ? (
            <>
              <DocumentUploadForm
                action={uploadMockFile.bind(null, item.id)}
                initialError={typeof error === "string" ? error : undefined}
              />
            </>
          ) : (
            <div className="flex flex-1 flex-col gap-6">
              <div className="flex gap-3">
                {justSubmitted ? (
                  <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-lime-soft text-navy">
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  </span>
                ) : null}
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold text-foreground">
                    {justSubmitted ? "Document submitted" : "Your submitted document"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Your {item.label.toLowerCase()} was submitted and is waiting for review by your case team.
                  </p>
                </div>
              </div>
              {item.fileName ? (
                <FileCard
                  name={item.fileName}
                  meta={`${item.fileSize ? `${formatFileSize(item.fileSize)} • ` : ""}submitted`}
                >
                  {FILE_BADGE[item.status] ? (
                    <span className="mr-3 rounded-full bg-sky-tint px-4 py-1 text-xs font-medium text-primary">
                      {FILE_BADGE[item.status]}
                    </span>
                  ) : null}
                </FileCard>
              ) : null}
              <div className="mt-auto flex flex-wrap gap-4 pt-10">
                <Link
                  href="/checklist"
                  className="flex h-10 w-[180px] items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Back to checklist
                </Link>
                {item.fileName ? (
                  <a
                    href={`/checklist/${item.id}/file`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-[180px] items-center justify-center rounded-full border border-input bg-secondary text-sm font-semibold text-foreground hover:bg-secondary/70"
                  >
                    View submitted file
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : null}
              </div>
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-4">
          {canUpload ? (
            <>
              <Card title="What to provide">
                <p className="text-sm text-foreground">{guidance.provideIntro}</p>
                {guidance.provideItems.length > 0 ? (
                  <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-foreground">
                    {guidance.provideItems.map((text) => (
                      <li key={text}>{text}</li>
                    ))}
                  </ul>
                ) : null}
              </Card>
              <Card title="Before uploading" className="flex-1">
                <CheckList
                  items={[
                    "Make sure the document is clear and readable.",
                    "Include all pages, if applicable.",
                    "Use an accepted file type and size.",
                  ]}
                />
              </Card>
            </>
          ) : (
            <Card title="What happens next" className="flex-1">
              <CheckList
                items={[
                  "Your case team will review the document.",
                  "We will notify you if changes are needed.",
                  "Track the status in Document Checklist.",
                ]}
              />
            </Card>
          )}
        </div>
      </div>
      {item.status === "submitted" ? (
        <div className="self-start">
          <DemoSwitchButton role="admin" next={`/admin/review-queue/${uid}/${item.id}`} label="Demo · Switch to staff" />
        </div>
      ) : null}
    </main>
  );
}
