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
import { aiCheckLabel, getAiReviewStore, runAiCheck, type AiCheck } from "@/lib/ai-review.ts";
import Image from "next/image";
import { StatusPill } from "@/components/patterns/status-pill";
import { PageHeader } from "@/components/layouts/page-header";
import { DataTable } from "@/components/patterns/data-table";
import { ArrowLink } from "@/components/ui/arrow-link";

const TABS = [
  { id: "all", label: "All" },
  { id: "document", label: "Documents" },
  { id: "intake", label: "Intake" },
] as const;
type TabId = (typeof TABS)[number]["id"];

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

// Staff "Review queue": Admin's quality checks across every client
// (CURRENT_USER_FLOW_V2: Admin checks uploaded documents and the CIF
// before anything goes to the consultant), oldest first.
export default async function AdminReviewQueuePage({ searchParams }: PageProps<"/admin/review-queue">) {
  await requireRole(["admin"]);
  const { type } = await searchParams;
  const tab = (TABS.some((item) => item.id === type) ? type : "all") as TabId;

  const queue = buildReviewQueue(getChecklistStore().getAllClientIds().map(queueClient));
  const count = (id: TabId) => (id === "all" ? queue.length : queue.filter((item) => item.kind === id).length);
  const shown = tab === "all" ? queue : queue.filter((item) => item.kind === tab);
  const checks = new Map(
    queue.flatMap((row) => (row.item ? [[row.key, runAiCheck(row.clientId, row.item)] as const] : []))
  );
  const decisions = getAiReviewStore();
  const flagged = queue.filter(
    (row) => checks.get(row.key)?.status === "issue" && !decisions.getDecision(row.clientId, row.item!.id, row.item!.fileName ?? "")
  );
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

  return (
    <main className="flex flex-col gap-5 pt-2 lg:pt-6">
      <PageHeader
        title="Review queue"
        subtitle="Review intake answers and documents submitted by your clients."
      />

      <section className="flex items-start gap-5 rounded-xl border border-border bg-card px-6 py-6">
        <div className="flex w-[100px] shrink-0 flex-col items-center gap-1">
          <div className="relative size-[100px]">
            <span aria-hidden className="ai-orb-glow absolute inset-2 rounded-full bg-azure blur-xl" />
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
            <svg
              aria-hidden
              viewBox="0 0 41 43"
              className="absolute -left-[19px] bottom-0 h-[43px] w-[41px] fill-primary"
            >
              <path d="M41 0 C38 20 28 36 0 43 C18 43 32 40 41 34 Z" />
            </svg>
            <p className="relative text-lg font-medium text-primary-foreground">{summary}</p>
          </div>
          <p className="pl-8 text-sm text-muted-foreground">AI checks run on submitted files. Staff decide every document outcome.</p>
        </div>
      </section>

      <nav aria-label="Filter queue" className="flex flex-wrap gap-4">
        {TABS.map((item) => {
          const active = item.id === tab;
          return (
            <Link
              key={item.id}
              href={item.id === "all" ? "/admin/review-queue" : `/admin/review-queue?type=${item.id}`}
              scroll={false}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-12 items-center rounded-full border border-input px-6 text-sm font-semibold text-foreground",
                active ? "bg-secondary" : "bg-card hover:bg-secondary"
              )}
            >
              {item.label} ({count(item.id)})
            </Link>
          );
        })}
      </nav>

      <DataTable
        columns={["Client / application", "Submission", "Review status", "AI check", "Received", "Action"]}
        emptyMessage="Nothing waiting for review. Nice work."
        rows={shown.map((item) => ({
          key: item.key,
          cells: [
            <span key="client" className="flex flex-col gap-[3px]">
              <span className="font-semibold">{item.clientName}</span>
              <span className="text-muted-foreground">{item.applicationId}</span>
            </span>,
            item.title,
            "Awaiting staff review",
            <AiCheckCell key="ai" check={checks.get(item.key)} decision={item.item ? decisions.getDecision(item.clientId, item.item.id, item.item.fileName ?? "") : undefined} />,
            item.receivedAt ? formatTimeAgo(item.receivedAt) : "—",
            <ArrowLink key="action" href={item.href}>
              {item.actionLabel}
            </ArrowLink>,
          ],
        }))}
      />
      <p className="text-sm text-muted-foreground">Approval stays pending until a staff member clicks Approve document.</p>
    </main>
  );
}

function AiCheckCell({ check, decision }: { check?: AiCheck; decision?: "confirmed" | "dismissed" }) {
  if (!check) return <span className="text-muted-foreground">{"\u2014"}</span>;
  if (decision) return <StatusPill tone="muted">{decision === "confirmed" ? "Confirmed by staff" : "Dismissed"}</StatusPill>;
  return (
    <StatusPill tone={check.status === "issue" ? "alert" : check.status === "clean" ? "filled" : "muted"}>
      {aiCheckLabel(check)}
    </StatusPill>
  );
}
