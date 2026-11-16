import type { ComponentProps } from "react";
import { cn } from "cn";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      className={cn(
        "h-12 w-full rounded-full border border-input bg-card scheme-light px-4 text-base text-foreground outline-none transition-[box-shadow] placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50 read-only:bg-muted aria-invalid:border-coral",
        className
      )}
      {...props}
    />
  );
}
