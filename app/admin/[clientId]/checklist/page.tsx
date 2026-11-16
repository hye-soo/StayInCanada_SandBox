import { getClientChecklist } from "@/lib/client-checklist.ts";
import { STATUS_BADGE_CLASS, STATUS_LABEL } from "@/lib/status-display.ts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { forwardToRcic, requestChanges } from "../actions.ts";

function Note({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-secondary/50 p-3">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <p className="mt-1 text-sm">{children}</p>
    </div>
  );
}

// Checklist tab: Admin's document quality check (no Figma frame yet —
// same card language as the rest of the profile).
export default async function AdminClientChecklistPage({
  params,
  searchParams,
}: PageProps<"/admin/[clientId]/checklist">) {
  const { clientId } = await params;
  const { error } = await searchParams;
  const { items } = getClientChecklist(clientId);

  return (
    <section className="flex flex-col gap-4">
      {typeof error === "string" ? <p className="text-sm text-destructive">{error}</p> : null}
      {items.map((item) => (
        <article key={item.id} className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">{item.label}</h2>
              {item.fileName ? <p className="text-sm text-muted-foreground">{item.fileName}</p> : null}
            </div>
            <Badge variant="outline" className={STATUS_BADGE_CLASS[item.status]}>
              {STATUS_LABEL[item.status]}
            </Badge>
          </div>

          {item.status === "submitted" ? (
            <>
              {item.rcicFlagNote ? <Note title="RCIC flagged this — needs your action">{item.rcicFlagNote}</Note> : null}
              {item.aiReport ? <Note title="AI suggestion, pending review">{item.aiReport}</Note> : null}
              {item.aiFormSuggestion ? (
                <Note title="AI-suggested form entry — preview only, not a working auto-fill">
                  {item.aiFormSuggestion}
                </Note>
              ) : null}
              <form action={forwardToRcic.bind(null, clientId, item.id)} className="flex flex-col gap-2">
                <Textarea name="note" placeholder="Optional internal note for RCIC (not shown to the client)" />
                <Button type="submit" className="h-12 self-start rounded-full px-6 font-semibold">
                  Forward to RCIC for review
                </Button>
              </form>
              <form
                action={requestChanges.bind(null, clientId, item.id)}
                className="flex flex-col gap-2 border-t border-border pt-4"
              >
                <Textarea
                  name="comment"
                  placeholder="Message to the client explaining what needs fixing"
                  defaultValue={item.rcicFlagNote}
                />
                <Button type="submit" variant="outline" className="h-12 self-start rounded-full px-6 font-semibold">
                  Request changes (notifies client by email)
                </Button>
              </form>
            </>
          ) : null}
        </article>
      ))}
    </section>
  );
}
