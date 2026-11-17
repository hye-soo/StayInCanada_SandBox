import Link from "next/link";
import { getClientIntake, getClientQuestionnaireSubmittedAt } from "@/lib/client-questionnaire.ts";
import { INTAKE_CATEGORIES } from "@/lib/data/intake-steps.ts";
import { getCategoryReview, getCategoryStatus } from "@/lib/intake.ts";
import { getQuestionnaireFlagStore } from "@/lib/questionnaire-flag-store.ts";
import { getIntakeReviewStore } from "@/lib/intake-review-store.ts";
import { getClientIdentity } from "@/lib/client-identity.ts";
import { getIntakeReviewRows, INTAKE_REVIEW_LABEL, type IntakeReviewStatus } from "@/lib/intake-review.ts";
import { ArrowLink } from "@/components/ui/arrow-link";
import { StatusPill } from "@/components/patterns/status-pill";
import { IntakeAnswersDialog } from "@/components/patterns/intake-answers-dialog";

const PILL_TONE = {
  reviewed: "filled",
  needs_review: "outline",
  sent_back: "alert",
  waiting: "muted",
} as const satisfies Record<IntakeReviewStatus, string>;

const ACTION_LABEL: Record<IntakeReviewStatus, string | null> = {
  reviewed: "View answers",
  needs_review: "Review",
  sent_back: "View answers",
  waiting: null,
};

// Figma "All clients_Profile_Intake / Staff" — Intake tab.
export default async function AdminClientIntakePage({ params }: PageProps<"/admin/[clientId]/intake">) {
  const { clientId } = await params;
  const answers = getClientIntake(clientId);
  const submittedAt = getClientQuestionnaireSubmittedAt(clientId);
  const { rows, reviewedCount, total } = getIntakeReviewRows(
    Object.fromEntries(INTAKE_CATEGORIES.map(({ id }) => [id, getCategoryStatus(id, answers)])),
    getQuestionnaireFlagStore().getFlags(clientId),
    getIntakeReviewStore().getReviewed(clientId)
  );
  const clientName = getClientIdentity(clientId).name;
  const firstName = clientName.split(" ")[0];

  return (
    <section className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <h2 className="text-2xl font-semibold text-foreground">Intake review</h2>
        <p className="text-[15px] text-muted-foreground">
          {submittedAt
            ? `Submitted by ${firstName} · ${new Date(submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
            : "Not submitted yet"}
        </p>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-card">
        <div className="flex h-[70px] items-center justify-between px-6">
          <h3 className="text-xl font-semibold text-foreground">Intake sections</h3>
          <span className="text-[15px] font-medium text-muted-foreground">
            {reviewedCount} of {total} reviewed
          </span>
        </div>
        <ul>
          {rows.map((row) => {
            const action = ACTION_LABEL[row.status];
            return (
              <li key={row.categoryId} className="mx-3 flex min-h-[76px] items-center gap-[18px] border-t border-border px-3 py-2">
                <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
                  <span className="text-[17px] font-semibold text-foreground">{row.label}</span>
                  <span className="truncate text-sm text-muted-foreground">{row.context}</span>
                </div>
                <StatusPill tone={PILL_TONE[row.status]}>{INTAKE_REVIEW_LABEL[row.status]}</StatusPill>
                <span className="flex w-[130px] shrink-0 justify-end">
                  {action === "View answers" ? (
                    <IntakeAnswersDialog
                      clientName={clientName}
                      sectionLabel={row.label}
                      groups={getCategoryReview(row.categoryId, answers)}
                    />
                  ) : action ? (
                    <ArrowLink href={`/admin/${clientId}/intake/${row.categoryId}`}>{action}</ArrowLink>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <Link href={`/admin/${clientId}/summary`} className="mt-2 self-end px-1 text-sm text-muted-foreground hover:underline">
        View / download full CIF summary
      </Link>
    </section>
  );
}
