"use client";

import { useState, type FormEvent } from "react";
import { cn } from "cn";
import { Checkbox } from "@/components/ui/checkbox";
import { DIALOG_PRIMARY, DIALOG_SECONDARY, StatusDialog } from "@/components/patterns/status-dialog";
import { useSaveAction } from "@/components/patterns/use-save-action";

// Figma "Review answers" footer: "Send to case team" stays disabled
// until the confirmation is ticked ("Ready to send"). The server action
// re-checks both the confirmation and that every section is complete.
export function SubmitReviewForm({ action, error }: { action: (formData: FormData) => Promise<void>; error?: string }) {
  const [confirmed, setConfirmed] = useState(false);
  const submit = useSaveAction(action);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit.run(new FormData(event.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex min-h-9 cursor-pointer items-center gap-3 text-base text-foreground">
        <Checkbox
          name="declaration"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
          className="size-5"
        />
        I have checked my answers and confirm they are accurate to the best of my knowledge.
      </label>
      <div className="flex flex-wrap items-center gap-5">
        <button
          type="submit"
          disabled={!confirmed}
          className={cn(
            "h-12 w-[180px] rounded-lg text-base font-semibold transition-colors",
            confirmed ? "bg-primary text-primary-foreground hover:bg-primary/90" : "cursor-not-allowed bg-secondary text-muted-foreground"
          )}
        >
          Send to case team
        </button>
        <p className="text-sm text-muted-foreground">
          Your case team will review your intake and contact you if anything needs clarification.
        </p>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <StatusDialog
        open={submit.pending}
        title="Submitting your intake..."
        body="Please wait while your answers are sent to your case team."
      />
      <StatusDialog
        open={submit.failed}
        title="Your intake wasn't submitted"
        body="Your draft is saved. Please try again. We'll show a confirmation when submission succeeds."
        onClose={submit.dismiss}
      >
        <button type="button" onClick={submit.retry} className={DIALOG_PRIMARY}>
          Try again
        </button>
        <button type="button" onClick={submit.dismiss} className={DIALOG_SECONDARY}>
          Back to review
        </button>
      </StatusDialog>
    </form>
  );
}
