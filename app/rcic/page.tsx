import { getCurrentClientItemsByStatus } from "@/lib/get-current-client-checklist.ts";
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
import { approveItem, requestChanges } from "./actions.ts";

export default async function RcicPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const items = getCurrentClientItemsByStatus("under_review");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Forwarded for RCIC review</h1>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing is waiting on RCIC review.</p>
      ) : (
        items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.label}</CardTitle>
              <CardDescription>
                Uploaded: {item.fileName} ({Math.round((item.fileSize ?? 0) / 1024)} KB)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {item.aiReport ? (
                <div className="rounded-[var(--radius-md)] border border-border bg-muted/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    AI suggestion, pending staff review
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

              <form action={requestChanges.bind(null, item.id)} className="flex flex-col gap-2">
                <Textarea
                  name="comment"
                  placeholder="What needs to change?"
                  required
                  className="text-sm"
                />
                <Button type="submit" variant="outline" className="self-start">
                  Request changes
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <form action={approveItem.bind(null, item.id)}>
                <Button type="submit">Approve</Button>
              </form>
            </CardFooter>
          </Card>
        ))
      )}
    </main>
  );
}
