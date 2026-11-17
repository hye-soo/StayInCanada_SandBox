import type { ReactNode } from "react";
import { cn } from "cn";
import { formatFeedTime } from "@/lib/format-time.ts";
import type { Memo } from "@/lib/memo-store.ts";
import { MemoBubble } from "@/components/patterns/memo-bubble";

export const FEED_PRIMARY =
  "flex h-10 items-center justify-center gap-1.5 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground hover:bg-primary/90";
export const FEED_OUTLINE =
  "flex h-10 items-center justify-center rounded-full border border-primary px-6 text-sm font-semibold text-primary hover:bg-secondary";

export function FeedTag({ children, filled }: { children: ReactNode; filled?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs",
        filled ? "bg-secondary text-primary" : "border border-primary text-primary"
      )}
    >
      {children}
    </span>
  );
}

interface MemoThreadCardProps {
  memo: Memo;
  // Whose screen this is: their own messages sit on the right.
  viewer: "client" | "staff";
  clientName: string;
  clientAvatarSrc?: string;
  // Staff feed: which client and application this memo belongs to.
  context?: ReactNode;
  // Shown under the viewer's first message (client: edit / delete).
  ownMessageExtra?: ReactNode;
  // Buttons along the bottom of the card.
  actions?: ReactNode;
}

// One memo thread in a Memo & Updates feed (Figma "Memo & Updates"),
// shared by the client and staff views.
export function MemoThreadCard({ memo, viewer, clientName, clientAvatarSrc, context, ownMessageExtra, actions }: MemoThreadCardProps) {
  const unread = viewer === "client" ? memo.unreadForClient : memo.unreadForStaff;
  const myTurn = viewer === "client" ? memo.waitingOn === "client" : memo.waitingOn === "team";
  const status =
    viewer === "client"
      ? myTurn ? "Waiting for you" : "Waiting for case team"
      : myTurn ? "Needs your reply" : "Waiting for client";
  const firstOwn = memo.messages.findIndex((message) => (message.from === "client") === (viewer === "client"));

  return (
    <li className={cn("flex flex-col gap-3 rounded-xl border border-primary/40 px-6 py-5", unread ? "bg-secondary" : "bg-card")}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <FeedTag>Memo</FeedTag>
          {unread ? <FeedTag>Unread</FeedTag> : null}
          {myTurn ? <FeedTag>{viewer === "client" ? "Action needed" : "Needs reply"}</FeedTag> : null}
        </div>
        <time className="shrink-0 text-[13px] text-foreground">{formatFeedTime(memo.updatedAt)}</time>
      </div>
      {context}
      <h2 className="text-xl font-semibold text-foreground">
        {memo.subject} : <span className="text-primary">{status}</span>
      </h2>
      <p className="-mt-2 text-xs text-muted-foreground">{memo.related.label}</p>

      <div className="flex flex-col gap-3">
        {memo.messages.map((message, index) => {
          const fromClient = message.from === "client";
          const mine = fromClient === (viewer === "client");
          return (
            <div key={index} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
              <MemoBubble
                compact
                side={mine ? "right" : "left"}
                avatarSrc={fromClient ? clientAvatarSrc : "/overview/advisor-avatar.png"}
                authorName={fromClient ? clientName : message.authorName}
                authorCaption={mine ? (viewer === "client" ? "You" : "Me") : fromClient ? clientName : message.authorName}
                authorRole={fromClient ? (mine ? clientName : "Client") : "Case coordinator"}
                message={message.body}
              />
              {index === firstOwn && ownMessageExtra ? <div className="mr-16 flex gap-1">{ownMessageExtra}</div> : null}
            </div>
          );
        })}
      </div>

      {actions ? <div className="flex flex-wrap justify-end gap-3">{actions}</div> : null}
    </li>
  );
}
