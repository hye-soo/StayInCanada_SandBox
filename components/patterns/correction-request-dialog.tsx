"use client";

import { useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/icon";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DIALOG_PRIMARY, DIALOG_SECONDARY, StatusDialog } from "@/components/patterns/status-dialog";
import { useSaveAction } from "@/components/patterns/use-save-action";

// Figma "Request intake correction": opened from "Need to correct an
// answer?" on a submitted intake.
export function CorrectionRequestDialog({ action }: { action: (formData: FormData) => Promise<void> }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [empty, setEmpty] = useState(false);
  const send = useSaveAction(action);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (!String(formData.get("message") ?? "").trim()) {
      setEmpty(true);
      return;
    }
    send.run(formData);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setEmpty(false);
          dialog.current?.showModal();
        }}
        className="mt-3 inline-flex h-10 items-center justify-center gap-1.5 self-start rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        Request correction
        <Icon src="/icons/arrow-up-right.svg" className="size-3" />
      </button>

      <dialog
        ref={dialog}
        aria-labelledby="correction-title"
        className="m-auto w-[min(580px,calc(100vw-2rem))] rounded-xl bg-card p-6 text-foreground shadow-card backdrop:bg-navy/50"
      >
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 id="correction-title" className="text-xl font-semibold">
              Request an intake correction
            </h2>
            <p className="text-sm text-muted-foreground">Tell your case team which submitted answer needs changing.</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="correction-message" className="text-sm">
              Message to your case team
            </Label>
            <Textarea
              id="correction-message"
              name="message"
              maxLength={1000}
              placeholder="Which section and answer should be corrected?"
              aria-invalid={empty || undefined}
              aria-describedby={empty ? "correction-error" : undefined}
              onChange={() => setEmpty(false)}
              className="min-h-24 rounded-3xl bg-card px-4 py-3 text-sm md:text-sm aria-invalid:border-coral aria-invalid:ring-0"
            />
            {empty ? (
              <p id="correction-error" className="text-sm text-destructive">
                Tell your team which answer needs changing.
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-6">
            <button
              type="submit"
              disabled={send.pending}
              className="h-10 w-[200px] rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              Send request
            </button>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Cancel
            </button>
          </div>
        </form>
      </dialog>

      <StatusDialog
        open={send.pending}
        title="Sending your request..."
        body="Please wait while we send your message to your case team."
      />
      <StatusDialog
        open={send.failed}
        title="Your request wasn't sent"
        body="Your message is still in the form. Please try again."
        onClose={send.dismiss}
      >
        <button type="button" onClick={send.retry} className={DIALOG_PRIMARY}>
          Try again
        </button>
        <button type="button" onClick={send.dismiss} className={DIALOG_SECONDARY}>
          Keep editing
        </button>
      </StatusDialog>
    </>
  );
}
