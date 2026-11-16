import Image from "next/image";
import Link from "next/link";
import { cn } from "cn";

interface MemoBubbleProps {
  avatarSrc: string;
  authorName: string;
  // Small caption under the avatar, e.g. "Me".
  authorCaption?: string;
  message: string;
  href?: string;
  linkLabel?: string;
  // Which side the author sits on: the client sees staff on the left,
  // staff see their own memo on the right.
  side?: "left" | "right";
  // Second caption line, e.g. "Case coordinator".
  authorRole?: string;
  // Smaller avatar and darker bubble for the Memo & Updates feed.
  compact?: boolean;
}

// Avatar + speech bubble with its tail under the corner nearest the
// avatar (Figma "Memo from Staff" / "Updates & Memo").
export function MemoBubble({
  avatarSrc,
  authorName,
  authorCaption,
  message,
  href,
  linkLabel,
  side = "left",
  authorRole,
  compact,
}: MemoBubbleProps) {
  const right = side === "right";
  const body = (
    <>
      {message}
      {linkLabel ? <span className="underline underline-offset-2"> {linkLabel}</span> : null}
    </>
  );
  const bubbleClass = compact
    ? "relative block rounded-[28px] bg-navy py-3 pr-7 pl-5 text-[15px] font-medium text-white"
    : "relative block rounded-[32px] bg-memo py-5 pr-8 pl-6 text-base font-medium text-white";

  return (
    <div className={cn("flex items-start gap-1", right && "flex-row-reverse")}>
      <div className={cn("flex shrink-0 flex-col items-center", compact ? "mt-0 gap-0.5" : "mt-[19px] gap-1")}>
        <Image
          src={avatarSrc}
          alt={authorName}
          width={66}
          height={66}
          className={cn("rounded-full bg-peach object-cover", compact ? "size-12" : "size-[66px]")}
        />
        {authorCaption ? (
          <span className={cn("text-foreground", compact ? "mt-1 text-xs text-muted-foreground" : "text-sm")}>{authorCaption}</span>
        ) : null}
        {authorRole ? <span className="text-xs text-muted-foreground">{authorRole}</span> : null}
      </div>
      <div className={cn("relative min-w-0", right ? "pr-[21px]" : "pl-[21px]")}>
        <Image
          src="/overview/memo-tail.svg"
          alt=""
          width={45}
          height={41}
          className={cn("absolute bottom-0 h-[40.5px] w-[44.5px]", right ? "right-0 -scale-x-100" : "left-0")}
        />
        {href ? (
          <Link href={href} className={bubbleClass}>
            {body}
          </Link>
        ) : (
          <p className={bubbleClass}>{body}</p>
        )}
      </div>
    </div>
  );
}
