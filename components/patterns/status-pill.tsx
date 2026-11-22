import { cn } from "cn";

type Tone = "filled" | "outline" | "alert" | "muted";

const TONE_CLASS: Record<Tone, string> = {
  filled: "border-secondary bg-secondary text-navy",
  outline: "border-primary text-primary",
  alert: "border-coral text-destructive",
  muted: "border-border text-muted-foreground",
};

// Figma "Review status" pill (30px tall, 122px wide).
export function StatusPill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-[30px] min-w-[122px] shrink-0 whitespace-nowrap items-center justify-center rounded-full border px-3 text-sm font-medium",
        TONE_CLASS[tone]
      )}
    >
      {children}
    </span>
  );
}
