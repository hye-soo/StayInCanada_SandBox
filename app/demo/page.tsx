import Link from "next/link";
import { Inbox, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { MOCK_INVITES, MOCK_USERS } from "@/lib/data/mock-users.ts";
import { fillDemoChecklist, fillDemoIntake, resetDemo, setAiOrbMode, startAiPassportDemo } from "./actions.ts";
import { getAiReviewStore } from "@/lib/ai-review.ts";
import { DemoSwitchButton } from "./demo-switch-button";

const SENDER = "FlowOui";
const SENDER_ADDRESS = "invitations@flowoui.example";
const RECEIVED_AT = "10:24 AM";

// Mock email client: the first screen of the demo flow. The invitation
// email here is what a client would receive after their consultation;
// its button opens A01 for the seeded invite.
export default async function DemoInboxPage({ searchParams }: PageProps<"/demo">) {
  const { filled } = await searchParams;
  const invite = MOCK_INVITES[0]!;
  const orbMode = getAiReviewStore().orbMode;
  const firstName = invite.name.split(" ")[0];
  const caseManager = MOCK_USERS.find((user) => user.role === "admin")?.name ?? "Your case team";
  const subject = `${firstName}, your FlowOui invitation is ready`;

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-muted">
      <header className="flex items-center gap-4 border-b border-border bg-card px-6 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Inbox className="size-5" aria-hidden />
          Mail
        </span>
        <div className="flex h-9 flex-1 items-center gap-2 rounded-full bg-muted px-4 text-sm text-muted-foreground md:max-w-md">
          <Search className="size-4" aria-hidden />
          Search mail
        </div>
        <span className="ml-auto hidden text-sm text-muted-foreground sm:inline">{invite.email}</span>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-80 shrink-0 flex-col border-r border-border bg-card md:flex">
          <h2 className="px-5 py-4 text-sm font-semibold text-foreground">Inbox</h2>
          <div className="mx-2 rounded-lg bg-secondary px-3 py-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-bold text-foreground">{SENDER}</span>
              <span className="text-xs text-muted-foreground">{RECEIVED_AT}</span>
            </div>
            <p className="truncate text-sm font-semibold text-foreground">{subject}</p>
            <p className="truncate text-xs text-muted-foreground">
              You&apos;re invited to set up your FlowOui account
            </p>
          </div>
        </aside>

        <main className="flex flex-1 flex-col gap-6 p-6 md:p-10">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-semibold text-foreground">{subject}</h1>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-navy text-primary-foreground">
                <Logo className="size-5" />
              </span>
              <div className="text-sm">
                <p className="font-semibold text-foreground">
                  {SENDER}{" "}
                  <span className="font-normal text-muted-foreground">&lt;{SENDER_ADDRESS}&gt;</span>
                </p>
                <p className="text-muted-foreground">to {invite.email}</p>
              </div>
              <span className="ml-auto text-xs text-muted-foreground">{RECEIVED_AT}</span>
            </div>
          </div>

          <article className="flex max-w-2xl flex-col gap-5 rounded-[var(--radius-xl)] bg-card p-8 text-sm leading-6 text-foreground">
            <Logo className="size-8 text-navy" />
            <p>Hi {firstName},</p>
            <p>
              Thanks for choosing us for your application. Your case team has set up your FlowOui
              account, where you&apos;ll share your information, upload documents and follow your
              application&apos;s progress, step by step.
            </p>
            <p>Create your account to get started:</p>
            <Button
              className="h-12 self-start rounded-full px-8"
              render={<Link href={`/invite/${invite.token}`}>Accept invitation</Link>}
              nativeButton={false}
            />
            <p className="text-xs text-muted-foreground">
              This invitation is linked to {invite.email} and can be used once.
            </p>
            <p>
              Talk soon,
              <br />
              {caseManager}, your case team at FlowOui
            </p>
          </article>

          <div className="mt-auto flex items-center gap-4 text-xs text-muted-foreground">
            <form action={resetDemo}>
              <button type="submit" className="underline">
                Reset demo
              </button>
            </form>
            <form action={fillDemoIntake}>
              <button type="submit" className="underline">
                Fill Olivia&apos;s intake
              </button>
            </form>
            <form action={fillDemoChecklist}>
              <button type="submit" className="underline">
                Fill Olivia&apos;s documents
              </button>
            </form>
            <form action={startAiPassportDemo}>
              <button type="submit" className="underline">
                Start AI passport review
              </button>
            </form>
            <a href="/demo/passport-olivia-v2.pdf" download className="underline">
              Download passport v2 (for the re-upload)
            </a>
            <form action={setAiOrbMode} className="flex items-center gap-1">
              <span>AI orb:</span>
              {(["auto", "working", "idle"] as const).map((mode) => (
                <button
                  key={mode}
                  type="submit"
                  name="mode"
                  value={mode}
                  aria-pressed={orbMode === mode}
                  className={orbMode === mode ? "rounded-full bg-primary px-2 py-0.5 text-primary-foreground" : "rounded-full px-2 py-0.5 underline"}
                >
                  {mode === "auto" ? "Auto" : mode === "working" ? "Working" : "Idle"}
                </button>
              ))}
            </form>
            {filled === "ai" ? (
              <span className="flex items-center gap-3">
                Olivia&apos;s passport v1 is in the review queue.
                <DemoSwitchButton role="admin" next="/admin/review-queue" label="Open as Noah" />
              </span>
            ) : filled === "documents" ? (
              <span>Olivia&apos;s documents are set to mixed statuses.</span>
            ) : filled ? (
              <span>Olivia&apos;s intake is filled in (not submitted).</span>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
