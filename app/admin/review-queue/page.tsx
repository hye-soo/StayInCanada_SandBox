import Link from "next/link";
import { cn } from "cn";
import { requireRole } from "@/lib/firebase/session.ts";
import { getChecklistStore } from "@/lib/checklist-store.ts";
import { getClientChecklist } from "@/lib/client-checklist.ts";
import { getClientIdentity } from "@/lib/client-identity.ts";
import { getClientProfile } from "@/lib/client-profile.ts";
import { getClientIntake, getClientQuestionnaireSubmittedAt } from "@/lib/client-questionnaire.ts";
import { INTAKE_CATEGORIES } from "@/lib/data/intake-steps.ts";
import { formatTimeAgo } from "@/lib/format-time.ts";
import { getCategoryStatus } from "@/lib/intake.ts";
import { getIntakeReviewRows } from "@/lib/intake-review.ts";
import { getIntakeReviewStore } from "@/lib/intake-review-store.ts";
import { getQuestionnaireFlagStore } from "@/lib/questionnaire-flag-store.ts";
import { buildReviewQueue, type ReviewQueueClient } from "@/lib/review-queue.ts";
import { getAiReviewStore, runAiCheck } from "@/lib/ai-review.ts";
import Image from "next/image";
import { AiCheckPill } from "@/components/patterns/ai-check-pill";
import { PageHeader } from "@/components/layouts/page-header";
import { DataTable } from "@/components/patterns/data-table";
import { ArrowUpRight } from "lucide-react";

function queueClient(clientId: string): ReviewQueueClient {
  const answers = getClientIntake(clientId);
  const { rows } = getIntakeReviewRows(
    Object.fromEntries(INTAKE_CATEGORIES.map(({ id }) => [id, getCategoryStatus(id, answers)])),
    getQuestionnaireFlagStore().getFlags(clientId),
    getIntakeReviewStore().getReviewed(clientId)
  );
  return {
    clientId,
    name: getClientIdentity(clientId).name,
    applicationId: getClientProfile(clientId).applicationId,
    items: getClientChecklist(clientId).items,
    intakeSubmittedAt: getClientQuestionnaireSubmittedAt(clientId),
    intakeSections: rows.map((row) => ({ categoryId: row.categoryId, label: row.label, status: row.status })),
  };
}

const CHIP = "flex h-7 items-center rounded-full px-5 text-xs font-semibold";

// Staff "Review queue" (Figma "AI Review Assistant" 01/09/14): Admin's
// quality checks across every client, oldest first, with the AI check
// on each uploaded document. Staff decide every outcome.
export default async function AdminReviewQueuePage({ searchParams }: PageProps<"/admin/review-queue">) {
  const session = await requireRole(["admin"]);
  const params = await searchParams;
  const read = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : "");
  const query = read("q").trim().toLowerCase();
  const mine = read("assigned") === "1";
  const docsOnly = read("type") === "document";

  const queue = buildReviewQueue(getChecklistStore().getAllClientIds().map(queueClient));
  // Documents first (each with its AI check), then intake sections; both
  // oldest first. sort() is stable, so the queue's own order holds.
  const shown = [...queue].sort((a, b) => Number(a.kind !== "document") - Number(b.kind !== "document")).filter(
    (row) =>
      (!docsOnly || row.kind === "document") &&
      (!mine || getClientProfile(row.clientId).assignedAdvisorName === session.displayName) &&
      (!query || `${row.clientName} ${row.applicationId} ${row.title}`.toLowerCase().includes(query))
  );
  const checks = new Map(
    queue.flatMap((row) => (row.item ? [[row.key, runAiCheck(row.clientId, row.item)] as const] : []))
  );
  const decisions = getAiReviewStore();
  const decisionFor = (row: (typeof queue)[number]) =>
    row.item ? decisions.getDecision(row.clientId, row.item.id, row.item.fileName ?? "") : undefined;
  const flagged = queue.filter((row) => checks.get(row.key)?.status === "issue" && !decisionFor(row));
  const latestApproval = decisions.latestApproval();
  const checking =
    decisions.orbMode === "auto" ? [...checks.values()].some((check) => check.status === "checking") : decisions.orbMode === "working";
  const summary =
    flagged.length === 1
      ? `${flagged[0]!.clientName.split(" ")[0]}\u2019s ${flagged[0]!.item!.label.toLowerCase()} has a finding for staff to review.`
      : flagged.length > 1
        ? `${flagged.length} submissions have findings for staff to review.`
        : latestApproval
          ? `${getClientIdentity(latestApproval.clientId).name.split(" ")[0]}\u2019s ${getChecklistStore().getItem(latestApproval.clientId, latestApproval.itemId)?.label.toLowerCase() ?? "document"} has been approved by staff.`
          : "No open findings right now.";

  const href = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { q: read("q") || undefined, assigned: mine ? "1" : undefined, type: docsOnly ? "document" : undefined, ...changes };
    for (const [key, value] of Object.entries(merged)) if (value) next.set(key, value);
    const qs = next.toString();
    return qs ? `/admin/review-queue?${qs}` : "/admin/review-queue";
  };

  return (
    <main className="flex flex-col gap-5 pt-2 lg:pt-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground">Staff workspace / Review queue</p>
        <PageHeader title="Review queue" subtitle="Review intake answers and documents submitted by your clients." />
      </div>

      <section className="flex items-start gap-5 rounded-xl border border-border bg-card px-6 py-6">
        <div className="flex w-[100px] shrink-0 flex-col items-center gap-1">
          <div className="relative size-[100px]">
            <span aria-hidden className="ai-orb-glow absolute inset-3 rounded-full bg-azure blur-lg" />
            {checking ? (
              <span
                aria-hidden
                className="ai-orb-ring absolute inset-2 rounded-full border-2 border-transparent border-t-azure border-r-azure/40"
              />
            ) : null}
            <Image src="/ai/review-assistant.png" alt="" width={100} height={100} className="ai-orb relative size-[100px]" />
          </div>
          <p className="text-center text-sm font-semibold leading-tight text-primary">AI review assistant</p>
          {checking ? <p className="whitespace-nowrap text-xs text-muted-foreground">{"Checking files\u2026"}</p> : null}
        </div>
        <div className="flex min-w-0 flex-col gap-2 pt-1">
          <div className="relative ml-3 self-start rounded-[34px] bg-primary px-6 py-5">
            <svg aria-hidden viewBox="0 0 41 43" className="absolute -left-[19px] bottom-0 h-[43px] w-[41px] fill-primary">
              <path d="M41 0 C38 20 28 36 0 43 C18 43 32 40 41 34 Z" />
            </svg>
            <p className="relative text-lg font-medium text-primary-foreground">{summary}</p>
          </div>
          <p className="pl-8 text-sm text-muted-foreground">AI checks run on submitted files. Staff decide every document outcome.</p>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <form action="/admin/review-queue" className="w-full max-w-[385px]">
          {mine ? <input type="hidden" name="assigned" value="1" /> : null}
          {docsOnly ? <input type="hidden" name="type" value="document" /> : null}
          <input
            type="search"
            name="q"
            defaultValue={read("q")}
            aria-label="Search clients or submissions"
            placeholder="Search clients or submissions"
            className="h-11 w-full rounded-md border border-border bg-card px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </form>
        <Link
          href={href({ assigned: mine ? undefined : "1" })}
          scroll={false}
          aria-pressed={mine}
          className={cn(CHIP, mine ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/70")}
        >
          Assigned to me
        </Link>
        <Link
          href={href({ type: docsOnly ? undefined : "document" })}
          scroll={false}
          aria-pressed={docsOnly}
          className={cn(CHIP, docsOnly ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/70")}
        >
          Documents
        </Link>
        <span className={cn(CHIP, "bg-secondary text-foreground")}>Oldest first</span>
      </div>

      <DataTable
        columns={["Client / application", "Submission", "Review status", "AI check", "Received", "Action"]}
        emptyMessage={query || mine || docsOnly ? "Nothing matches these filters." : "Nothing waiting for review. Nice work."}
        rows={shown.map((row) => {
          const check = checks.get(row.key);
          const decision = decisionFor(row);
          const open = check?.status === "issue" && !decision;
          return {
            key: row.key,
            className: open ? "bg-aqua-tint" : undefined,
            cells: [
              <span key="client" className="flex flex-col gap-1">
                <span className="text-base font-semibold">{row.clientName}</span>
                <span className="text-xs text-muted-foreground">{row.applicationId}</span>
              </span>,
              <span key="title" className="text-base">{row.title}</span>,
              "Awaiting staff review",
              check ? <AiCheckPill key="ai" check={check} decision={decision} /> : <span key="ai" className="text-muted-foreground">{"\u2014"}</span>,
              row.receivedAt ? formatTimeAgo(row.receivedAt) : "\u2014",
              check?.status === "checking" ? (
                <span key="action" className="text-muted-foreground">{"\u2014"}</span>
              ) : (
                <Link key="action" href={row.href} className="inline-flex items-center gap-0.5 font-semibold text-primary hover:underline">
                  {row.kind === "document" ? "Review document" : row.actionLabel}
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
              ),
            ],
          };
        })}
      />
      <p className="text-base text-muted-foreground">Approval stays pending until a staff member clicks Approve document.</p>
    </main>
  );
}
