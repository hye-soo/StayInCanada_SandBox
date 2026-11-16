const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatTimeAgo(timestamp: number, now: number = Date.now()): string {
  const elapsed = now - timestamp;
  if (elapsed < MINUTE) return "Just now";
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m ago`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h ago`;
  return `${Math.floor(elapsed / DAY)}d ago`;
}

// "Saved today at 10:42 AM", or "Saved draft" for an older save.
export function formatSavedLabel(savedAt: number | undefined): string {
  if (!savedAt) return "Not saved yet";
  const time = new Date(savedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return new Date(savedAt).toDateString() === new Date().toDateString() ? `Saved today at ${time}` : "Saved draft";
}

// Memo & Updates feed: "Today, 9:30 AM", "Yesterday, 3:10 PM", "Nov 2, 11:20 AM".
export function formatFeedTime(timestamp: number, now: number = Date.now()): string {
  const date = new Date(timestamp);
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const today = new Date(now);
  const yesterday = new Date(now);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return `Today, ${time}`;
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${time}`;
}
