import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { CorrectionRequestDialog } from "@/components/patterns/correction-request-dialog";

const PRIMARY = "inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90";

interface IntakeSubmittedProps {
  visaLabel: string;
  applicationId: string;
  submittedAt: number;
  // Staff have started reviewing (at least one section marked reviewed).
  underReview: boolean;
  // Just sent a correction request (Figma "Correction request received").
  correctionSent: boolean;
  requestCorrection: (formData: FormData) => Promise<void>;
}

function receivedLabel(submittedAt: number): string {
  const date = new Date(submittedAt);
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return date.toDateString() === new Date().toDateString()
    ? `today at ${time}`
    : `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${time}`;
}

// Figma "Intake awaiting review": My Intake once the intake is sent
// (what "View intake status" on the success popup opens).
export function IntakeSubmitted({
  visaLabel,
  applicationId,
  submittedAt,
  underReview,
  correctionSent,
  requestCorrection,
}: IntakeSubmittedProps) {
  return (
    <main className="flex flex-col gap-6 pt-2">
      <header className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground">
          My Intake · {visaLabel} · {applicationId}
        </p>
        <h1 className="text-[32px] font-bold leading-10 text-foreground">
          {underReview ? "Your intake is under review" : "Your intake is awaiting review"}
        </h1>
        <p className="text-sm text-muted-foreground">Your submitted answers are with your case team.</p>
      </header>

      {correctionSent ? (
        <section role="status" className="flex flex-col gap-2 rounded-xl bg-lime-soft px-6 py-5">
          <h2 className="text-lg font-semibold text-foreground">Your correction request has been received</h2>
          <p className="text-sm text-foreground">
            Your case team will follow up in Memo &amp; Updates. Your submitted answers remain on record.
          </p>
        </section>
      ) : null}

      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
        <h2 className="text-[22px] font-semibold text-foreground">
          {underReview ? "Your case team is checking your answers" : "Your case team will review your answers"}
        </h2>
        <p className="text-sm font-semibold text-primary">Next action: Case team</p>
        <p className="text-[15px] text-muted-foreground">
          You don&apos;t need to resubmit your intake. If your team needs more information, they&apos;ll send a request
          in Memo &amp; Updates.
        </p>
        <p className="text-[13px] text-muted-foreground">
          {underReview
            ? `Review in progress · Intake received ${receivedLabel(submittedAt)}`
            : `Intake received ${receivedLabel(submittedAt)} · Waiting for review to begin`}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-6">
          <Link href="/questionnaire/review" className={PRIMARY}>
            View submitted answers
          </Link>
          <Link href="/updates" className="text-sm font-semibold text-primary hover:underline">
            Memo &amp; Updates
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground">Keep your documents moving</h2>
          <p className="text-sm text-muted-foreground">
            Your intake is with the team. You can still provide outstanding documents.
          </p>
          <Link href="/checklist" className={`${PRIMARY} mt-3 self-start px-8`}>
            Open checklist
            <Icon src="/icons/arrow-up-right.svg" className="size-3" />
          </Link>
        </section>
        <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground">Need to correct an answer?</h2>
          <p className="text-sm text-muted-foreground">
            Let your case team know which section and answer needs changing.
          </p>
          <CorrectionRequestDialog action={requestCorrection} />
        </section>
      </div>
    </main>
  );
}
