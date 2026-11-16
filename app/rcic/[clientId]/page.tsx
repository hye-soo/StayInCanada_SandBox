import { requireRole } from "@/lib/firebase/session.ts";
import { getClientChecklist } from "@/lib/client-checklist.ts";
import {
  getClientIntake,
  getClientQuestionnaireSubmittedAt,
} from "@/lib/client-questionnaire.ts";
import { getClientSummary, needsRcicValidation } from "@/lib/client-directory.ts";
import { getCategoryStatus, INTAKE_STATUS_BADGE_CLASS, INTAKE_STATUS_LABEL } from "@/lib/intake.ts";
import { INTAKE_CATEGORIES } from "@/lib/data/intake-steps.ts";
import { STATUS_BADGE_CLASS, STATUS_LABEL } from "@/lib/status-display.ts";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { approveItem, flagForAdmin } from "./actions.ts";

export default async function RcicClientPage({
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
  const answers = getClientIntake(clientId);
  const submittedAt = getClientQuestionnaireSubmittedAt(clientId);
  const summary = getClientSummary(clientId);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Client {clientId}</h1>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Intake (read-only)</h2>
          <Link
            href={`/rcic/${clientId}/summary`}
            className="text-sm text-muted-foreground hover:underline"
          >
            View / download CIF summary
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          {submittedAt
            ? `Intake submitted ${new Date(submittedAt).toLocaleString()}`
            : "Intake not yet submitted by the client"}
        </p>
        <ul className="flex flex-col gap-2">
          {INTAKE_CATEGORIES.map((category) => {
            const status = getCategoryStatus(category.id, answers);
            return (
              <li
                key={category.id}
                className="flex items-center justify-between rounded-[var(--radius-md)] border border-border p-3"
              >
                <span className="text-sm">{category.label}</span>
                <Badge variant="outline" className={INTAKE_STATUS_BADGE_CLASS[status]}>
                  {INTAKE_STATUS_LABEL[status]}
                </Badge>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Documents</h2>
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle>{item.label}</CardTitle>
                <Badge variant="outline" className={STATUS_BADGE_CLASS[item.status]}>
                  {STATUS_LABEL[item.status]}
                </Badge>
              </div>
              {item.fileName ? <CardDescription>{item.fileName}</CardDescription> : null}
            </CardHeader>
            {item.status === "under_review" ? (
              <>
                <CardContent className="flex flex-col gap-4">
                  {item.aiReport ? (
                    <div className="rounded-[var(--radius-md)] border border-border bg-muted/50 p-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        AI suggestion, pending RCIC review
                      </p>
                      <p className="mt-1 text-sm">{item.aiReport}</p>
                    </div>
                  ) : null}
                  {item.aiFormSuggestion ? (
                    <div className="rounded-[var(--radius-md)] border border-border bg-muted/50 p-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        AI-suggested form entry — preview only, not a working auto-fill
                      </p>
                      <p className="mt-1 text-sm">{item.aiFormSuggestion}</p>
                    </div>
                  ) : null}
                  {item.adminNote ? (
                    <div className="rounded-[var(--radius-md)] border border-border p-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        Admin&apos;s internal note
                      </p>
                      <p className="mt-1 text-sm">{item.adminNote}</p>
                    </div>
                  ) : null}
                  <form
                    action={flagForAdmin.bind(null, clientId, item.id)}
                    className="flex flex-col gap-2"
                  >
                    <Textarea
                      name="note"
                      placeholder="What needs to change? (internal note to Admin — Admin contacts the client)"
                      required
                      className="text-sm"
                    />
                    <Button type="submit" variant="outline" className="self-start">
                      Flag for Admin
                    </Button>
                  </form>
                </CardContent>
                <CardFooter>
                  <form action={approveItem.bind(null, clientId, item.id)}>
                    <Button type="submit">Approve</Button>
                  </form>
                </CardFooter>
              </>
            ) : null}
          </Card>
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Application preparation</h2>
        <p className="text-sm text-muted-foreground">
          Current stage: {summary.stage.label}
          {needsRcicValidation(summary) || summary.submission.state !== "awaiting_validation" ? (
            <>
              {" "}
              ·{" "}
              <Link href={`/rcic/${clientId}/validation`} className="underline">
                Go to final review
              </Link>
            </>
          ) : null}
        </p>
      </section>
    </main>
  );
}
