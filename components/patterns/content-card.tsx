import type { ReactNode } from "react";
import { cn } from "cn";

interface ContentCardProps {
  title: ReactNode;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

// White 12px-radius card with a 20px section title (Figma "Your
// application journey", "Latest Notifications", ...).
export function ContentCard({ title, icon, className, children }: ContentCardProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-border bg-card p-6 text-foreground",
        className
      )}
    >
      <h2 className="flex items-center gap-3 text-xl font-semibold">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}
