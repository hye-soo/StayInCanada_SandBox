import type { ActivityEntry } from "@/lib/activity-log-store.ts";

function formatWhen(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Figma "Recent case activity": one line per event, time on the right.
export function ActivityList({ entries, emptyMessage }: { entries: ActivityEntry[]; emptyMessage: string }) {
  if (entries.length === 0) return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  return (
    <ul className="flex flex-col text-sm text-foreground">
      {entries.map((entry, index) => (
        <li key={index} className="flex justify-between gap-6 leading-5">
          <span>{entry.message}</span>
          <span className="shrink-0 text-right">{formatWhen(entry.timestamp)}</span>
        </li>
      ))}
    </ul>
  );
}
