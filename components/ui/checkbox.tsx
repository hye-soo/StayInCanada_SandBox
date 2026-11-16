import type { ComponentProps } from "react";
import { cn } from "cn";

export function Checkbox({ className, ...props }: Omit<ComponentProps<"input">, "type">) {
  return (
    <input
      type="checkbox"
      data-slot="checkbox"
      // scheme-light: the app has no dark theme, so native controls stay light.
      className={cn("size-4 shrink-0 accent-primary scheme-light", className)}
      {...props}
    />
  );
}
