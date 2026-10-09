import Link from "next/link";
import { getCurrentClientChecklist } from "@/lib/get-current-client-checklist.ts";
import { STATUS_BADGE_CLASS, STATUS_LABEL } from "@/lib/status-display.ts";
import { Badge } from "@/components/ui/badge";

export default function ChecklistPage() {
  const { items } = getCurrentClientChecklist();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Your document checklist</h1>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={`/checklist/${item.id}`}
              className="block rounded-[var(--radius-lg)] border border-border bg-card p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium">{item.label}</span>
                <Badge variant="outline" className={STATUS_BADGE_CLASS[item.status]}>
                  {STATUS_LABEL[item.status]}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{item.whyNeeded}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
