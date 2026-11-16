import Image from "next/image";
import Link from "next/link";
import { cn } from "cn";
import { PROGRESS_STATUS_LABEL, type ProgressStatus } from "@/lib/overview-summary.ts";

type Tone = "lime" | "sky";

const TILE_CLASS: Record<Tone, string> = {
  lime: "bg-lime-pale",
  sky: "bg-sky-soft",
};

const PILL_CLASS: Record<ProgressStatus, string> = {
  not_started: "border-track",
  in_progress: "border-sky-soft",
  completed: "border-lime-border",
};

interface ProgressCardProps {
  href: string;
  icon: string;
  tone: Tone;
  title: string;
  status: ProgressStatus;
  description: string;
}

// Figma "Client Intake" / "Document checklist" row: icon tile, status
// pill, title and a one-line summary; the whole card links onward.
export function ProgressCard({ href, icon, tone, title, status, description }: ProgressCardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-1 rounded-lg border border-border bg-card px-5 py-5 text-foreground shadow-card transition-colors hover:border-primary"
    >
      <div className="flex items-center gap-2.5">
        <span className={cn("flex size-11 items-center justify-center rounded-[5px]", TILE_CLASS[tone])}>
          <Image src={icon} alt="" width={24} height={24} />
        </span>
        <div className="flex flex-col items-start">
          <span
            className={cn(
              "rounded-full border px-2.5 text-[10px] leading-5 text-foreground",
              PILL_CLASS[status]
            )}
          >
            {PROGRESS_STATUS_LABEL[status]}
          </span>
          <h2 className="text-xl font-semibold leading-7">{title}</h2>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}
