import { requireRole } from "@/lib/firebase/session.ts";
import { getClientChecklist } from "@/lib/client-checklist.ts";
import { getClientQuestionnaire } from "@/lib/client-questionnaire.ts";
import { getSectionStatus } from "@/lib/questionnaire-progress.ts";
import {
  SECTION_LABELS,
  SECTION_STATUS_BADGE_CLASS,
  SECTION_STATUS_LABEL,
} from "@/lib/questionnaire-fields.ts";
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
import { forwardToRcic } from "./actions.ts";
import type { QuestionnaireSectionId } from "@/lib/types.ts";

export default async function AdminClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole(["admin"]);
  const { clientId } = await params;
  const { error } = await searchParams;
  const { items } = getClientChecklist(clientId);
  const questionnaire = getClientQuestionnaire(clientId);
  const sectionIds = Object.keys(SECTION_LABELS) as QuestionnaireSectionId[];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Client {clientId}</h1>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Intake (read-only)</h2>
        <ul className="flex flex-col gap-2">
          {sectionIds.map((sectionId) => {
            const status = getSectionStatus(questionnaire, sectionId);
            return (
              <li
                key={sectionId}
                className="flex items-center justify-between rounded-[var(--radius-md)] border border-border p-3"
              >
                <span className="text-sm">{SECTION_LABELS[sectionId]}</span>
                <Badge variant="outline" className={SECTION_STATUS_BADGE_CLASS[status]}>
                  {SECTION_STATUS_LABEL[status]}
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
              <CardTitle>{item.label}</CardTitle>
              <CardDescription>
                {item.status}
                {item.fileName ? ` — ${item.fileName}` : ""}
              </CardDescription>
            </CardHeader>
            {item.status === "submitted" ? (
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
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-2">
                  <form
                    action={forwardToRcic.bind(null, clientId, item.id)}
                    className="flex w-full flex-col gap-2"
                  >
                    <Textarea
                      name="note"
                      placeholder="Optional internal note for RCIC (not shown to the client)"
                      className="text-sm"
                    />
                    <Button type="submit" className="self-start">
                      Forward to RCIC for review
                    </Button>
                  </form>
                </CardFooter>
              </>
            ) : null}
          </Card>
        ))}
      </section>
    </main>
  );
}
