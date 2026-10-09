import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentClientChecklistItem } from "@/lib/get-current-client-checklist.ts";
import { STATUS_BADGE_CLASS, STATUS_LABEL, STATUS_NEXT_STEP } from "@/lib/status-display.ts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { uploadMockFile } from "./actions.ts";

export default async function ChecklistItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ itemId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { itemId } = await params;
  const { error } = await searchParams;
  const item = getCurrentClientChecklistItem(itemId);
  if (!item) notFound();

  const canUpload = item.status === "required" || item.status === "changes_required";

  const nextStep = STATUS_NEXT_STEP[item.status];
  const whoseTurnLabel =
    nextStep.whoseTurn === "none" ? "Nobody" : nextStep.whoseTurn === "client" ? "You" : "Staff";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <Link href="/checklist" className="text-sm text-muted-foreground hover:underline">
        Back to checklist
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>{item.label}</CardTitle>
            <Badge variant="outline" className={STATUS_BADGE_CLASS[item.status]}>
              {STATUS_LABEL[item.status]}
            </Badge>
          </div>
          <CardDescription>{item.whyNeeded}</CardDescription>
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

          {item.staffComment ? (
            <div className="rounded-[var(--radius-md)] border border-border p-3">
              <p className="text-xs font-medium text-muted-foreground">Staff comment</p>
              <p className="mt-1 text-sm">{item.staffComment}</p>
            </div>
          ) : null}

          <div className="text-sm">
            <p>
              <span className="font-medium">Whose turn: </span>
              {whoseTurnLabel}
            </p>
            <p className="text-muted-foreground">{nextStep.whatHappensNext}</p>
          </div>

          {item.fileName ? (
            <p className="text-sm text-muted-foreground">
              Uploaded: {item.fileName} ({Math.round(item.fileSize! / 1024)} KB)
            </p>
          ) : null}

          {canUpload ? (
            <form
              action={uploadMockFile.bind(null, item.id)}
              className="flex flex-col gap-2 border-t border-border pt-4"
            >
              <label htmlFor="file" className="text-sm font-medium">
                Upload document (max 4 MB) — mock only, no file is stored
              </label>
              <input id="file" name="file" type="file" required className="text-sm" />
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" className="self-start">
                Upload
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
