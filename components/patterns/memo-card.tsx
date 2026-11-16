import { MemoBubble } from "@/components/patterns/memo-bubble";

interface MemoCardProps {
  authorName: string;
  avatarSrc: string;
  message: string;
  href: string;
  linkLabel: string;
}

// Figma "Memo from Staff" (client dashboard).
export function MemoCard(props: MemoCardProps) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-primary bg-card px-6 pt-5 pb-7 shadow-card">
      <h2 className="text-xl font-semibold text-foreground">Memo from Staff</h2>
      <MemoBubble {...props} />
    </section>
  );
}
