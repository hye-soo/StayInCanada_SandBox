import { switchDemoUser } from "./actions.ts";

// Figma "Demo · ..." buttons: jump between Alice (client) and Maya
// (staff) while recording, without signing out and in.
export function DemoSwitchButton({ role, next, label }: { role: "client" | "admin"; next: string; label: string }) {
  return (
    <form action={switchDemoUser.bind(null, role, next)}>
      <button
        type="submit"
        className="flex h-10 items-center justify-center rounded-full border border-dashed border-muted-foreground px-6 text-sm text-muted-foreground hover:bg-secondary"
      >
        {label}
      </button>
    </form>
  );
}
