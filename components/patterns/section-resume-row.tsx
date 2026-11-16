import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "cn";
import { Icon } from "@/components/ui/icon";

interface SectionResumeRowProps {
  href: string;
  number: number;
  title: string;
  status: string;
  complete: boolean;
}

// Figma "Intake / Section resume row": number (or check), title and
// status, then an arrow into the section's first form.
export function SectionResumeRow({ href, number, title, status, complete }: SectionResumeRowProps) {
  return (
    <Link href={href} className="flex h-20 items-center gap-3 border-b border-border hover:bg-mist">
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium text-muted-foreground",
          complete ? "bg-lime-soft" : "bg-secondary"
        )}
      >
        {complete ? <Check className="size-4" aria-label="Complete" /> : number}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-base font-medium text-foreground">{title}</span>
        <span className="text-sm text-muted-foreground">{status}</span>
      </span>
      {complete ? (
        <Icon src="/icons/arrow-up-right.svg" className="mr-2 size-4 text-primary" />
      ) : (
        <ChevronRight className="mr-2 size-5 text-primary" aria-hidden />
      )}
    </Link>
  );
}
