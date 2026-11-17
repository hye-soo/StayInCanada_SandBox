import Link from "next/link";
import { cn } from "cn";
import { requireRole } from "@/lib/firebase/session.ts";
import { getChecklistStore } from "@/lib/checklist-store.ts";
import { getClientIdentity } from "@/lib/client-identity.ts";
import { getClientProfile } from "@/lib/client-profile.ts";
import { DEMO_CLIENTS } from "@/lib/data/demo-clients.ts";
import { formatFeedTime } from "@/lib/format-time.ts";
import { getMemoStore, type Memo } from "@/lib/memo-store.ts";
import type { Notification } from "@/lib/notification-store.ts";
import { getNotificationsFor } from "@/lib/recipient-notifications.ts";
import { MemoComposeDialog, MemoReplyDialog, type RelatedOption } from "@/components/patterns/memo-dialogs";
import { FEED_OUTLINE, FEED_PRIMARY, FeedTag, MemoThreadCard } from "@/components/patterns/memo-thread-card";
import { Icon } from "@/components/ui/icon";
import { staffMarkMemoRead, staffMarkUpdateRead, staffReplyToMemo, staffSendMemo } from "./actions.ts";

const FILTERS = [
  { id: "all", label: "All activity" },
  { id: "reply", label: "Needs reply" },
  { id: "unread", label: "Unread" },
] as const;
type FilterId = (typeof FILTERS)[number]["id"];

type FeedItem =
  | { kind: "memo"; at: number; clientId: string; memo: Memo }
  | { kind: "update"; at: number; update: Notification };

const RELATED_OPTIONS: RelatedOption[] = [
  { value: "general", label: "General" },
  { value: "intake", label: "Their intake" },
  { value: "checklist", label: "Their document checklist" },
];

function avatarFor(clientId: string): string | undefined {
  return DEMO_CLIENTS.some((client) => client.id === clientId) ? undefined : "/overview/client-avatar.png";
}

// Staff "Memo & Updates": every client's memo threads plus the staff
// notifications (uploads, submissions, correction requests). Staff can
// start a memo with any client, reply, and keep their own read state.
export default async function AdminMemoPage({ searchParams }: PageProps<"/admin/notifications">) {
  const session = await requireRole(["admin"]);
  const { filter: rawFilter } = await searchParams;
  const filter = (FILTERS.some((item) => item.id === rawFilter) ? rawFilter : "all") as FilterId;

  const clientIds = getChecklistStore().getAllClientIds();
  const clientOptions: RelatedOption[] = clientIds
    .map((id) => ({ value: id, label: `${getClientIdentity(id).name} · ${getClientProfile(id).applicationId}` }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const feed: FeedItem[] = [
    ...getMemoStore()
      .listAll()
      .map(({ clientId, memo }): FeedItem => ({ kind: "memo", at: memo.updatedAt, clientId, memo })),
    ...getNotificationsFor(session).map((update): FeedItem => ({ kind: "update", at: update.createdAt, update })),
  ]
    .filter((item) => {
      if (filter === "reply") return item.kind === "memo" && item.memo.waitingOn === "team";
      if (filter === "unread") return item.kind === "memo" ? item.memo.unreadForStaff : !item.update.readAt;
      return true;
    })
    .sort((a, b) => b.at - a.at);

  const needsReply = getMemoStore()
    .listAll()
    .filter(({ memo }) => memo.waitingOn === "team").length;

  return (
    <main className="flex flex-col gap-4 pt-2">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Staff workspace</p>
          <h1 className="text-[32px] font-bold leading-10 text-foreground">Memo &amp; Updates</h1>
          <p className="text-base text-muted-foreground">Conversations with your clients and case activity, together.</p>
        </div>
        <MemoComposeDialog
          mode="new"
          options={RELATED_OPTIONS}
          clientOptions={clientOptions}
          action={staffSendMemo}
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
              href={item.id === "all" ? "/admin/notifications" : `/admin/notifications?filter=${item.id}`}
              scroll={false}
              aria-current={active ? "page" : undefined}
              className={cn(
                "border-b-2 px-2 py-2.5 text-[15px]",
                active ? "border-primary font-semibold text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
              {item.id === "reply" && needsReply > 0 ? ` (${needsReply})` : ""}
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
          {filter === "all" ? "No activity yet." : "Nothing here right now."}
        </p>
      ) : null}

      <ul className="flex flex-col gap-4">
        {feed.map((item) => {
          if (item.kind === "update") {
            const { update } = item;
            return (
              <li key={`update-${update.id}`} className="flex flex-col gap-3 rounded-xl border border-primary/40 bg-card px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-2">
                    <FeedTag filled>Update</FeedTag>
                    {update.readAt ? null : <FeedTag filled>Unread</FeedTag>}
                  </div>
                  <time className="text-[13px] text-foreground">{formatFeedTime(update.createdAt)}</time>
                </div>
                <h2 className="text-lg font-semibold text-foreground">{update.message}</h2>
                {update.detail ? <p className="-mt-2 text-[15px] text-foreground">{update.detail}</p> : null}
                <div className="flex flex-wrap justify-end gap-3">
                  <Link href={update.href} className={cn(FEED_PRIMARY, "w-[150px]")}>
                    Open
                    <Icon src="/icons/arrow-up-right.svg" className="size-3" />
                  </Link>
                  {update.readAt ? null : (
                    <form action={staffMarkUpdateRead}>
                      <input type="hidden" name="notificationId" value={update.id} />
                      <button type="submit" className={cn(FEED_OUTLINE, "w-[150px]")}>
                        Mark as read
                      </button>
                    </form>
                  )}
                </div>
              </li>
            );
          }

          const { clientId, memo } = item;
          const clientName = getClientIdentity(clientId).name;
          const lastClient = [...memo.messages].reverse().find((message) => message.from === "client");
          return (
            <MemoThreadCard
              key={`memo-${clientId}-${memo.id}`}
              memo={memo}
              viewer="staff"
              clientName={clientName}
              clientAvatarSrc={avatarFor(clientId)}
              context={
                <p className="-mb-1 text-sm text-muted-foreground">
                  {clientName} · {getClientProfile(clientId).applicationId}
                </p>
              }
              actions={
                <>
                  <Link href={`/admin/${clientId}`} className={cn(FEED_PRIMARY, "w-[180px]")}>
                    Open client
                    <Icon src="/icons/arrow-up-right.svg" className="size-3" />
                  </Link>
                  <MemoReplyDialog
                    memoId={memo.id}
                    subject={memo.subject}
                    quote={(lastClient ?? memo.messages[memo.messages.length - 1]!).body}
                    relatedLabel={`${clientName} · ${memo.related.label}`}
                    action={staffReplyToMemo}
                    hidden={{ clientId }}
                    triggerClassName={cn(FEED_OUTLINE, "w-[150px]")}
                  />
                  {memo.unreadForStaff ? (
                    <form action={staffMarkMemoRead}>
                      <input type="hidden" name="clientId" value={clientId} />
                      <input type="hidden" name="memoId" value={memo.id} />
                      <button type="submit" className={cn(FEED_OUTLINE, "w-[150px]")}>
                        Mark as read
                      </button>
                    </form>
                  ) : null}
                </>
              }
            />
          );
        })}
      </ul>
    </main>
  );
}
