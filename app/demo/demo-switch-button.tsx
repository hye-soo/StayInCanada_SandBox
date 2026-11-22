import { switchDemoUser } from "./actions.ts";

const DASHED =
  "flex h-10 items-center justify-center rounded-full border border-dashed border-muted-foreground px-6 text-sm text-muted-foreground hover:bg-secondary";

// Figma "Demo · ..." buttons: jump between Alice (client) and Maya
// (staff) while recording, without signing out and in.
export function DemoSwitchButton({
  role,
  next,
  label,
  className = DASHED,
}: {
  role: "client" | "admin";
  next: string;
  label: string;
  className?: string;
}) {
  return (
    <form action={switchDemoUser.bind(null, role, next)}>
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
