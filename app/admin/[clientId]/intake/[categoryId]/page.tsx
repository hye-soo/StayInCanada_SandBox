import Link from "next/link";
import { notFound } from "next/navigation";
import { getClientIntake } from "@/lib/client-questionnaire.ts";
import { INTAKE_CATEGORIES, type IntakeCategoryId } from "@/lib/data/intake-steps.ts";
import { getCategoryStatus } from "@/lib/intake.ts";
import { getQuestionnaireFlagStore } from "@/lib/questionnaire-flag-store.ts";
import { getIntakeReviewStore } from "@/lib/intake-review-store.ts";
import { getIntakeReviewRows, INTAKE_REVIEW_LABEL } from "@/lib/intake-review.ts";
import { IntakeCategoryAnswers } from "@/components/questionnaire-summary.tsx";
import { ContentCard } from "@/components/patterns/content-card";
import { StatusPill } from "@/components/patterns/status-pill";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { markCategoryReviewed, sendIntakeCategoryBack } from "../../actions.ts";

function isCategoryId(value: string): value is IntakeCategoryId {
  return INTAKE_CATEGORIES.some((category) => category.id === value);
}

// One intake category's answers, with Admin's review actions.
export default async function AdminIntakeCategoryPage({
  params,
  searchParams,
}: PageProps<"/admin/[clientId]/intake/[categoryId]">) {
  const { clientId, categoryId } = await params;
  if (!isCategoryId(categoryId)) notFound();
  const { error } = await searchParams;

  const answers = getClientIntake(clientId);
  const { rows } = getIntakeReviewRows(
    { [categoryId]: getCategoryStatus(categoryId, answers) },
    getQuestionnaireFlagStore().getFlags(clientId),
    getIntakeReviewStore().getReviewed(clientId)
  );
  const row = rows.find((r) => r.categoryId === categoryId)!;

  return (
    <section className="flex flex-col gap-4">
      <Link href={`/admin/${clientId}/intake`} className="text-sm text-muted-foreground hover:underline">
        ← Back to intake review
      </Link>

      <ContentCard
        title={
          <span className="flex w-full flex-wrap items-center justify-between gap-3">
            {row.label}
            <StatusPill tone={row.status === "reviewed" ? "filled" : row.status === "sent_back" ? "alert" : "outline"}>
              {INTAKE_REVIEW_LABEL[row.status]}
            </StatusPill>
          </span>
        }
      >
        {row.status === "sent_back" ? <p className="text-sm text-destructive">{row.context}</p> : null}
        <IntakeCategoryAnswers answers={answers} categoryId={categoryId} />
      </ContentCard>

      {typeof error === "string" ? <p className="text-sm text-destructive">{error}</p> : null}

      {row.status === "needs_review" || row.status === "reviewed" ? (
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
          {row.status === "needs_review" ? (
            <form action={markCategoryReviewed.bind(null, clientId, categoryId)}>
              <Button type="submit" className="h-12 rounded-full px-6 font-semibold">
                Mark reviewed
              </Button>
            </form>
          ) : null}
          <form action={sendIntakeCategoryBack.bind(null, clientId, categoryId)} className="flex flex-col gap-2">
            <Textarea name="note" placeholder="Message to the client explaining what needs fixing" required />
            <Button type="submit" variant="outline" className="h-12 self-start rounded-full px-6 font-semibold">
              Send back to client (notifies by email)
            </Button>
          </form>
        </div>
      ) : null}
    </section>
  );
}
