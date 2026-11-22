import { cn } from "cn";
import { aiCheckLabel, type AiCheck, type FindingDecision } from "@/lib/ai-review.ts";

// Figma "AI Review Assistant" pill colours.
export const AI_PILL = {
  amber: "bg-peach text-[#8a5000]",
  blue: "bg-aqua-tint text-primary",
  grey: "bg-secondary text-foreground",
  green: "bg-[#e4f0dc] text-[#2f5d1e]",
} as const;

export function AiPill({ tone, children, className }: { tone: keyof typeof AI_PILL; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 min-w-[130px] items-center justify-center whitespace-nowrap rounded-full px-3 text-xs font-semibold",
        AI_PILL[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

// AI check result, or the staff decision on it once there is one.
export function AiCheckPill({ check, decision }: { check: AiCheck; decision?: FindingDecision }) {
  if (decision === "confirmed") return <AiPill tone="green">Confirmed by staff</AiPill>;
  if (decision === "dismissed") return <AiPill tone="grey">Dismissed</AiPill>;
  const tone = check.status === "issue" ? "amber" : check.status === "checking" ? "blue" : "grey";
  return <AiPill tone={tone}>{aiCheckLabel(check)}</AiPill>;
}
