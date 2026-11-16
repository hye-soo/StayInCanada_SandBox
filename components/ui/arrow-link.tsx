import Link from "next/link";
import { Icon } from "@/components/ui/icon";

// Figma "Action / …" text link with the up-right arrow.
export function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
    >
      {children}
      <Icon src="/icons/arrow-up-right.svg" className="size-[15px]" />
    </Link>
  );
}
