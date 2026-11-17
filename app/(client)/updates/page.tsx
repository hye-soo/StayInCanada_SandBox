import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "cn";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientChecklist, VISA_TYPE_LABEL } from "@/lib/client-checklist.ts";
import { getClientProfileStore } from "@/lib/client-profile-store.ts";
import { formatFeedTime } from "@/lib/format-time.ts";
import { getMemoStore, type Memo } from "@/lib/memo-store.ts";
import { getNotificationStore, type Notification } from "@/lib/notification-store.ts";
import { FEED_OUTLINE, FEED_PRIMARY, FeedTag, MemoThreadCard } from "@/components/patterns/memo-thread-card";
import { DeleteMemoButton, MemoComposeDialog, MemoReplyDialog, type RelatedOption } from "@/components/patterns/memo-dialogs";
import { Icon } from "@/components/ui/icon";
import { deleteMemo, editMemo, markMemoRead, markUpdateRead, replyToMemo, sendMemo } from "./actions.ts";

const FILTERS = [
  { id: "all", label: "All activity" },
  { id: "action", label: "Action needed" },
  { id: "unread", label: "Unread" },
] as const;
type FilterId = (typeof FILTERS)[number]["id"];


type FeedItem = { kind: "memo"; at: number; memo: Memo } | { kind: "update"; at: number; update: Notification };

// Figma "Memo & Updates / Client / All activity": memo threads with the
// case team and case updates, newest first, filterable.
export default async function UpdatesPage({ searchParams }: PageProps<"/updates">) {
  const { uid, displayName } = await requireRole(["client"]);
  const { filter: rawFilter } = await searchParams;
  const filter = (FILTERS.some((item) => item.id === rawFilter) ? rawFilter : "all") as FilterId;

  const { items, visaType } = getClientChecklist(uid);
  const { applicationId } = getClientProfileStore().getProfile(uid);
  const memos = getMemoStore().list(uid);
  // Updates are the client's notifications that carry a short explanation
  // (approvals, account ready); change requests show up as memos instead.
  const updates = getNotificationStore()
    .getForRecipient(uid)
    .filter((notification) => notification.detail);

  const feed: FeedItem[] = [
    ...memos.map((memo): FeedItem => ({ kind: "memo", at: memo.updatedAt, memo })),
    ...updates.map((update): FeedItem => ({ kind: "update", at: update.createdAt, update })),
  ]
    .filter((item) => {
      if (filter === "action") return item.kind === "memo" && item.memo.waitingOn === "client";
      if (filter === "unread") return item.kind === "memo" ? item.memo.unreadForClient : !item.update.readAt;
      return true;
    })
    .sort((a, b) => b.at - a.at || (a.kind === "memo" && b.kind === "memo" ? b.memo.seq - a.memo.seq : 0));

  const relatedOptions: RelatedOption[] = [
    { value: "general", label: "General question" },
    { value: "intake", label: "My Intake" },
    { value: "checklist", label: "Document checklist" },
    ...items.map((item) => ({ value: `doc:${item.id}`, label: `Document · ${item.label}` })),
  ];
  const firstName = displayName?.split(" ")[0] ?? "You";

  return (
    <main className="flex flex-col gap-4 pt-2">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">
            {VISA_TYPE_LABEL[visaType]} · {applicationId}
          </p>
          <h1 className="text-[32px] font-bold leading-10 text-foreground">Memo &amp; Updates</h1>
          <p className="text-base text-muted-foreground">Your conversations and case activity, together.</p>
        </div>
        <MemoComposeDialog
          mode="new"
          options={relatedOptions}
          action={sendMemo}
          triggerLabel="+ New memo"
          triggerClassName={cn(FEED_PRIMARY, "mt-7 w-[220px]")}
        />
      </header>

      <nav aria-label="Filter activity" className="flex gap-6">
        {FILTERS.map((item) => {
          const active = item.id === filter;
          return (
            <Link
              key={item.id}
              href={item.id === "all" ? "/updates" : `/updates?filter=${item.id}`}
              scroll={false}
              aria-current={active ? "page" : undefined}
              className={cn(
                "border-b-2 px-2 py-2.5 text-[15px]",
                active ? "border-primary font-semibold text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex justify-between px-1 text-sm text-muted-foreground">
        <span>Latest activity</span>
        <span>Newest first</span>
      </div>

      {feed.length === 0 ? (
        <p className="rounded-xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
          {filter === "all" ? "No activity yet. Send your case team a memo any time." : "Nothing here right now."}
        </p>
      ) : null}

      <ul className="flex flex-col gap-4">
        {feed.map((item) =>
          item.kind === "update" ? (
            <li
              key={`update-${item.update.id}`}
              className={cn("flex flex-col gap-3 rounded-xl border border-primary/40 px-6 py-5", item.update.readAt ? "bg-card" : "bg-card")}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-2">
                  <FeedTag filled>Update</FeedTag>
                  {item.update.readAt ? null : <FeedTag filled>Unread</FeedTag>}
                </div>
                <time className="text-[13px] text-foreground">{formatFeedTime(item.update.createdAt)}</time>
              </div>
              <div className="flex gap-3">
                <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-lime-soft text-primary">
                  <Check className="size-3.5" strokeWidth={3} aria-hidden />
                </span>
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-semibold text-foreground">{item.update.message}</h2>
                  <p className="text-[15px] text-foreground">{item.update.detail}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pl-9">
                <MemoComposeDialog
                  mode="new"
                  options={relatedOptions}
                  defaults={{
                    subject: `About: ${item.update.message}`,
                    related: relatedOptions.find((option) => `/checklist/${option.value.slice(4)}` === item.update.href)?.value,
                  }}
                  action={sendMemo}
                  triggerLabel="Ask a question"
                  triggerClassName={FEED_OUTLINE}
                />
                {item.update.readAt ? null : (
                  <form action={markUpdateRead}>
                    <input type="hidden" name="notificationId" value={item.update.id} />
                    <button type="submit" className={FEED_OUTLINE}>
                      Mark as read
                    </button>
                  </form>
                )}
              </div>
            </li>
          ) : (
            <MemoCard key={`memo-${item.memo.id}`} memo={item.memo} clientName={displayName ?? firstName} />
          )
        )}
      </ul>
    </main>
  );
}

function MemoCard({ memo, clientName }: { memo: Memo; clientName: string }) {
  const editable = memo.startedBy === "client" && memo.messages.length === 1;
  const lastStaff = [...memo.messages].reverse().find((message) => message.from === "staff");

  return (
    <MemoThreadCard
      memo={memo}
      viewer="client"
      clientName={clientName}
      clientAvatarSrc="/overview/client-avatar.png"
      ownMessageExtra={
        editable ? (
          <>
            <MemoComposeDialog
              mode="edit"
              options={[]}
              defaults={{ memoId: memo.id, subject: memo.subject, message: memo.messages[0]!.body }}
              action={editMemo}
              triggerLabel="Edit memo"
              triggerClassName="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-card hover:text-foreground"
            />
            <DeleteMemoButton memoId={memo.id} action={deleteMemo} />
          </>
        ) : undefined
      }
      actions={
        lastStaff ? (
          <>
            {memo.related.href && memo.actionLabel ? (
              <Link href={memo.related.href} className={cn(FEED_PRIMARY, "w-[220px]")}>
                {memo.actionLabel}
                <Icon src="/icons/arrow-up-right.svg" className="size-3" />
              </Link>
            ) : null}
            <MemoReplyDialog
              memoId={memo.id}
              subject={memo.subject}
              quote={lastStaff.body}
              relatedLabel={memo.related.label}
              action={replyToMemo}
              triggerClassName={cn(FEED_OUTLINE, "w-[150px]")}
            />
            {memo.unreadForClient ? (
              <form action={markMemoRead}>
                <input type="hidden" name="memoId" value={memo.id} />
                <button type="submit" className={cn(FEED_OUTLINE, "w-[150px]")}>
                  Mark as read
                </button>
              </form>
            ) : null}
          </>
        ) : undefined
      }
    />
  );
}
