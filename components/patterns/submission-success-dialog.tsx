"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

// Figma "Submission success / Thank you <name>": shown once, right after
// "Send to case team". One action, View intake status; X / Esc closes it
// and leaves the read-only submitted review.
export function SubmissionSuccessDialog({ firstName }: { firstName: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  function close() {
    dialog.current?.close();
    // Drop "?submitted=1" so a refresh doesn't show it again.
    router.replace("/questionnaire/review", { scroll: false });
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="submission-success-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      className="m-auto w-[min(640px,calc(100vw-2rem))] rounded-2xl bg-card p-8 text-foreground shadow-card backdrop:bg-navy/50"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="flex size-12 items-center justify-center rounded-full bg-lime-soft text-navy">
            <Check className="size-6" strokeWidth={2.5} aria-hidden />
          </span>
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="flex size-10 items-center justify-center rounded-full hover:bg-secondary"
          >
            <X className="size-5" />
          </button>
        </div>
        <h2 id="submission-success-title" className="text-[28px] font-semibold leading-9">
          Thank you, {firstName}!
        </h2>
        <p className="text-xl font-semibold">Your intake has been submitted.</p>
        <p className="text-base text-muted-foreground">
          Your answers are now with your case team. They&apos;ll review your information and contact you through Memo &amp;
          Updates if anything needs clarification.
        </p>
        <div>
          <Link
            href="/questionnaire"
            autoFocus
            className="flex h-10 w-[220px] items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            View intake status
          </Link>
        </div>
      </div>
    </dialog>
  );
}
