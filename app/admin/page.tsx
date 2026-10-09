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
import { forwardToRcic } from "./actions.ts";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const items = getCurrentClientItemsByStatus("submitted");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Submitted documents</h1>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing is waiting on admin review.</p>
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
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2">
              <form
                action={forwardToRcic.bind(null, item.id)}
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
          </Card>
        ))
      )}
    </main>
  );
}
