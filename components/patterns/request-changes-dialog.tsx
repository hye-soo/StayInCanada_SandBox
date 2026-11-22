"use client";

import { useRef, useState, type FormEvent } from "react";
import { Sparkles, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DIALOG_PRIMARY, DIALOG_SECONDARY, StatusDialog } from "@/components/patterns/status-dialog";
import { useSaveAction } from "@/components/patterns/use-save-action";

// Figma "04 · Request changes · AI draft": staff review and edit the
// AI-suggested message before it goes to the client.
export function RequestChangesDialog({
  clientFirstName,
  requirement,
  draft,
  action,
  triggerLabel,
  triggerClassName,
}: {
  clientFirstName: string;
  // e.g. "Alice Chang · Passport / v1"
  requirement: string;
  draft?: string;
  action: (formData: FormData) => Promise<void>;
  triggerLabel: string;
  triggerClassName: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [empty, setEmpty] = useState(false);
  const [version, setVersion] = useState(0);
  const send = useSaveAction(action);

  function open() {
    setEmpty(false);
    setVersion((value) => value + 1);
    dialog.current?.showModal();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const missing = !String(formData.get("message") ?? "").trim();
    setEmpty(missing);
    if (!missing) send.run(formData);
  }

  return (
    <>
      <button type="button" onClick={open} className={triggerClassName}>
        {triggerLabel}
      </button>
      <dialog
        ref={dialog}
        aria-label="Request changes"
        className="m-auto w-[min(640px,calc(100vw-2rem))] rounded-2xl bg-card p-8 text-foreground shadow-card backdrop:bg-navy/50"
      >
        <form key={version} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-semibold">Request changes</h2>
              <p className="text-sm text-muted-foreground">
                Review and edit the message before sending it to {clientFirstName}.
              </p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => dialog.current?.close()}
              className="flex size-9 items-center justify-center rounded-full hover:bg-secondary"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg bg-secondary px-4 py-3">
            <div className="flex flex-col">
              <p className="text-sm font-semibold">{requirement}</p>
              <p className="text-xs text-muted-foreground">Feedback is attached to this requirement.</p>
            </div>
            {draft ? (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-card px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="size-3.5" aria-hidden />
                AI suggested draft
              </span>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="change-request-message">Message to client</Label>
            <Textarea
              id="change-request-message"
              name="message"
              maxLength={2000}
              defaultValue={draft}
              placeholder="Explain what needs fixing"
              aria-invalid={empty || undefined}
              aria-describedby={empty ? "change-request-error" : "change-request-hint"}
              className="min-h-28 rounded-3xl bg-card px-4 py-3 text-sm md:text-sm aria-invalid:border-coral aria-invalid:ring-0"
            />
            {empty ? (
              <p id="change-request-error" className="text-sm text-destructive">
                Write a message for {clientFirstName}.
              </p>
            ) : (
              <p id="change-request-hint" className="text-xs text-muted-foreground">
                {clientFirstName} will see the message beside the requirement.
              </p>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={send.pending}
              className="h-10 w-[220px] rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              Send request
            </button>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="h-10 w-[140px] rounded-full border border-border bg-card text-sm font-semibold text-primary hover:bg-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </dialog>
      <StatusDialog open={send.pending} title="Sending..." body={`Sending your request to ${clientFirstName}.`} />
      <StatusDialog
        open={send.failed}
        title="Your request wasn't sent"
        body="What you wrote is still in the form. Please try again."
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
