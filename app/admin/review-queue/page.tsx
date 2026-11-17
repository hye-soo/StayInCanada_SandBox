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

  return (
    <main className="flex flex-col gap-5 pt-2 lg:pt-6">
      <PageHeader
        title="Review queue"
        subtitle="Documents and intake sections waiting for your check, oldest first"
      />

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
        columns={["Client", "Needs review", "Type", "Received", "Action"]}
        emptyMessage="Nothing waiting for review. Nice work."
        rows={shown.map((item) => ({
          key: item.key,
          cells: [
            <span key="client" className="flex flex-col gap-[3px]">
              <span className="font-semibold">{item.clientName}</span>
              <span className="text-muted-foreground">{item.applicationId}</span>
            </span>,
            item.title,
            item.kind === "document" ? "Document" : "Intake section",
            item.receivedAt ? formatTimeAgo(item.receivedAt) : "—",
            <ArrowLink key="action" href={item.href}>
              {item.actionLabel}
            </ArrowLink>,
          ],
        }))}
      />
    </main>
  );
}
