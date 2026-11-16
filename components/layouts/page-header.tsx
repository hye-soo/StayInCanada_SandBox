import type { ReactNode } from "react";

export function PageHeader({ title, subtitle }: { title: ReactNode; subtitle?: ReactNode }) {
  return (
    <header className="flex flex-col gap-1">
      <h1 className="text-[32px] font-bold leading-10 text-foreground">{title}</h1>
      {subtitle ? <p className="text-sm whitespace-pre-wrap text-foreground">{subtitle}</p> : null}
    </header>
  );
}
