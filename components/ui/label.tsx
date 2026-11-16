import type { ComponentProps } from "react";
import { cn } from "cn";

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label data-slot="label" className={cn("text-base text-foreground", className)} {...props} />
  );
}
