import type { ComponentProps } from "react";
import { cn } from "cn";

// Native select in the same 48px pill as Input.
export function Select({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      className={cn(
        "h-12 w-full appearance-none rounded-full border border-input bg-card bg-[url('/icons/chevron-down.svg')] bg-[length:16px] bg-[right_16px_center] bg-no-repeat pr-10 pl-4 text-base text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-coral disabled:cursor-not-allowed disabled:bg-muted",
        className
      )}
      {...props}
    />
  );
}
