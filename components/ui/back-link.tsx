import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// "‹ Document checklist": the small back link above a sub-page title.
export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1 self-start text-xs text-muted-foreground hover:text-foreground print:hidden"
    >
      <ChevronLeft className="size-3" aria-hidden />
      {children}
    </Link>
  );
}
