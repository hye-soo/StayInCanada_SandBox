import { ArrowLink } from "@/components/ui/arrow-link";
import { Icon } from "@/components/ui/icon";

interface CaseListCardProps {
  title: string;
  icon: string;
  actionLabel: string;
  emptyMessage: string;
  entries: { key: string; name: string; detail: string; href: string }[];
}

// Figma "Waiting on clients" / "Ready for consultant review".
export function CaseListCard({ title, icon, actionLabel, emptyMessage, entries }: CaseListCardProps) {
  return (
    <section className="flex min-h-[346px] flex-col gap-[13px] rounded-lg border border-border bg-card px-5 py-[17px] text-foreground">
      <h2 className="flex items-center gap-2.5 text-xl font-semibold">
        <span className="flex size-9 items-center justify-center rounded-md bg-lime-pale">
          <Icon src={icon} className="text-navy" />
        </span>
        {title}
      </h2>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className="flex flex-col gap-5">
          {entries.map((entry) => (
            <li key={entry.key} className="flex flex-col gap-[13px]">
              <div className="flex flex-col gap-[5px]">
                <span className="text-base font-semibold">{entry.name}</span>
                <span className="text-sm text-muted-foreground">{entry.detail}</span>
              </div>
              <ArrowLink href={entry.href}>{actionLabel}</ArrowLink>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
