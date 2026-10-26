import Link from "next/link";
import { QuickSwitch } from "./quick-switch.tsx";

interface Phase {
  label: string;
  note: string;
  href?: string;
  secondHref?: { label: string; href: string };
}

// One row per docs/OUR_USER_FLOW.md phase. Links point at the real,
// already-built pages (not sandbox copies) — this is a flow map over
// the existing app, not a separate mock product.
const PHASES: Phase[] = [
  { label: "Phase 1 — Onboarding", href: "/signup", note: "Sign up / log in" },
  { label: "Phase 2 — Client Intake", href: "/questionnaire", note: "CIF questionnaire" },
  { label: "Phase 3 — Documentation Collection", href: "/checklist", note: "Document checklist" },
  {
    label: "Phase 4 — Feedback & Validation",
    href: "/admin",
    note: "Admin/RCIC review",
    secondHref: { label: "RCIC view", href: "/rcic" },
  },
  {
    label: "Phase 5 — Application Preparation",
    note: "Package & submit, from a client's page in Phase 4 above",
  },
];

export default function SandboxHomePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sandbox: Full User Flow</h1>
        <p className="text-sm text-muted-foreground">
          One clickable path through every phase of docs/OUR_USER_FLOW.md.
        </p>
      </div>

      <QuickSwitch />

      <ul className="flex flex-col gap-3">
        {PHASES.map((phase) => (
          <li
            key={phase.label}
            className="flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-border bg-card p-4"
          >
            <div className="flex flex-col">
              {phase.href ? (
                <Link href={phase.href} className="font-medium hover:underline">
                  {phase.label}
                </Link>
              ) : (
                <span className="font-medium">{phase.label}</span>
              )}
              <span className="text-xs text-muted-foreground">{phase.note}</span>
            </div>
            {phase.secondHref ? (
              <Link href={phase.secondHref.href} className="text-sm text-muted-foreground hover:underline">
                {phase.secondHref.label}
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </main>
  );
}
