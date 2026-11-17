"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DIALOG_PRIMARY, DIALOG_SECONDARY, StatusDialog } from "@/components/patterns/status-dialog";
import { useSaveAction } from "@/components/patterns/use-save-action";

type Action = (formData: FormData) => Promise<void>;

export interface RelatedOption {
  value: string;
  label: string;
}

const FIELD_TEXTAREA = "min-h-24 rounded-3xl bg-card px-4 py-3 text-sm md:text-sm aria-invalid:border-coral aria-invalid:ring-0";
const SEND = "h-10 w-[220px] rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60";
const CANCEL = "h-10 w-[140px] rounded-full border border-border bg-card text-sm font-semibold text-primary hover:bg-secondary";

// Shared shell: title + close, body, "Send" / "Cancel", plus the same
// Sending / couldn't-send status dialogs as the rest of the app.
function MemoDialog({
  trigger,
  triggerClassName,
  triggerAriaLabel,
  title,
  sendLabel,
  action,
  children,
  validate,
}: {
  trigger: ReactNode;
  triggerClassName: string;
  triggerAriaLabel?: string;
  title: string;
  sendLabel: string;
  action: Action;
  children: (invalid: ReadonlySet<string>) => ReactNode;
  // Names of required fields left empty.
  validate: (formData: FormData) => string[];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [invalid, setInvalid] = useState<Set<string>>(new Set());
  const [version, setVersion] = useState(0);
  const send = useSaveAction(action, () => dialog.current?.close());

  function open() {
    setInvalid(new Set());
    setVersion((value) => value + 1);
    dialog.current?.showModal();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const missing = validate(formData);
    setInvalid(new Set(missing));
    if (missing.length > 0) return;
    send.run(formData);
  }

  return (
    <>
      <button type="button" onClick={open} aria-label={triggerAriaLabel} className={triggerClassName}>
        {trigger}
      </button>
      <dialog
        ref={dialog}
        aria-label={title}
        className="m-auto w-[min(640px,calc(100vw-2rem))] rounded-2xl bg-card p-8 text-foreground shadow-card backdrop:bg-navy/50"
      >
        <form key={version} onSubmit={handleSubmit} onChange={() => setInvalid(new Set())} noValidate className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-semibold">{title}</h2>
            <button
              type="button"
              aria-label="Close"
              onClick={() => dialog.current?.close()}
              className="flex size-9 items-center justify-center rounded-full hover:bg-secondary"
            >
              <X className="size-5" />
            </button>
          </div>
          {children(invalid)}
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <button type="submit" disabled={send.pending} className={SEND}>
              {sendLabel}
            </button>
            <button type="button" onClick={() => dialog.current?.close()} className={CANCEL}>
              Cancel
            </button>
          </div>
        </form>
      </dialog>
      <StatusDialog open={send.pending} title="Sending..." body="Please wait while we send your message to your case team." />
      <StatusDialog
        open={send.failed}
        title="Your message wasn't sent"
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

function FieldError({ show, id, children }: { show: boolean; id: string; children: ReactNode }) {
  return show ? (
    <p id={id} className="text-sm text-destructive">
      {children}
    </p>
  ) : null;
}

const required = (formData: FormData, names: string[]) =>
  names.filter((name) => !String(formData.get(name) ?? "").trim());

// Figma "New memo": subject, what it's about, message. Also used for
// "Ask a question" (prefilled) and editing a memo nobody has answered.
export function MemoComposeDialog({
  mode,
  options,
  clientOptions,
  defaults,
  action,
  triggerLabel,
  triggerClassName,
}: {
  mode: "new" | "edit";
  options: RelatedOption[];
  // Staff only: which client the memo goes to.
  clientOptions?: RelatedOption[];
  defaults?: { memoId?: string; subject?: string; related?: string; message?: string };
  action: Action;
  triggerLabel: string;
  triggerClassName: string;
}) {
  const edit = mode === "edit";
  return (
    <MemoDialog
      title={edit ? "Edit memo" : "New memo"}
      sendLabel={edit ? "Save memo" : "Send memo"}
      action={action}
      validate={(formData) => required(formData, clientOptions ? ["clientId", "subject", "message"] : ["subject", "message"])}
      trigger={edit ? <Pencil className="size-4" aria-hidden /> : triggerLabel}
      triggerAriaLabel={edit ? triggerLabel : undefined}
      triggerClassName={triggerClassName}
    >
      {(invalid) => (
        <>
          <p className="text-sm text-muted-foreground">
            {clientOptions ? "Send a note or request to a client. They'll see it in their Memo & Updates." : "Send a note or question to your case team."}
          </p>
          {clientOptions ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="memo-client">Client</Label>
              <Select
                id="memo-client"
                name="clientId"
                defaultValue=""
                aria-invalid={invalid.has("clientId") || undefined}
                aria-describedby={invalid.has("clientId") ? "memo-client-error" : undefined}
              >
                <option value="">Choose a client</option>
                {clientOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <FieldError show={invalid.has("clientId")} id="memo-client-error">
                Choose who the memo is for.
              </FieldError>
            </div>
          ) : null}
          {defaults?.memoId ? <input type="hidden" name="memoId" value={defaults.memoId} /> : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="memo-subject">Subject</Label>
            <Input
              id="memo-subject"
              name="subject"
              maxLength={120}
              defaultValue={defaults?.subject}
              placeholder="What would you like to discuss?"
              aria-invalid={invalid.has("subject") || undefined}
              aria-describedby={invalid.has("subject") ? "memo-subject-error" : undefined}
            />
            <FieldError show={invalid.has("subject")} id="memo-subject-error">
              Add a subject.
            </FieldError>
          </div>
          {edit ? null : (
            <div className="flex flex-col gap-2">
              <Label htmlFor="memo-related">Related to</Label>
              <Select id="memo-related" name="related" defaultValue={defaults?.related ?? "general"}>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="memo-message">Message</Label>
            <Textarea
              id="memo-message"
              name="message"
              maxLength={2000}
              defaultValue={defaults?.message}
              placeholder="Write your memo here..."
              aria-invalid={invalid.has("message") || undefined}
              aria-describedby={invalid.has("message") ? "memo-message-error" : undefined}
              className={FIELD_TEXTAREA}
            />
            <FieldError show={invalid.has("message")} id="memo-message-error">
              Write your message.
            </FieldError>
          </div>
        </>
      )}
    </MemoDialog>
  );
}

// Figma "Reply to memo": the message being answered, then the reply.
export function MemoReplyDialog({
  memoId,
  subject,
  quote,
  relatedLabel,
  action,
  triggerClassName,
  hidden,
}: {
  memoId: string;
  subject: string;
  quote: string;
  relatedLabel: string;
  action: Action;
  triggerClassName: string;
  // Extra form fields, e.g. the client id on the staff side.
  hidden?: Record<string, string>;
}) {
  return (
    <MemoDialog
      title="Reply to memo"
      sendLabel="Send reply"
      action={action}
      validate={(formData) => required(formData, ["message"])}
      trigger="Reply"
      triggerClassName={triggerClassName}
    >
      {(invalid) => (
        <>
          <input type="hidden" name="memoId" value={memoId} />
          {Object.entries(hidden ?? {}).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <div className="flex flex-col gap-1.5 rounded-lg bg-secondary px-4 py-3">
            <p className="text-base font-semibold">{subject}</p>
            <p className="text-sm">{quote}</p>
            <p className="text-xs text-muted-foreground">{relatedLabel}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`reply-${memoId}`}>Your reply</Label>
            <Textarea
              id={`reply-${memoId}`}
              name="message"
              maxLength={2000}
              placeholder="Write your reply here..."
              aria-invalid={invalid.has("message") || undefined}
              className={FIELD_TEXTAREA}
            />
            <FieldError show={invalid.has("message")} id={`reply-${memoId}-error`}>
              Write your reply.
            </FieldError>
          </div>
          <p className="text-xs text-muted-foreground">Your reply stays attached to this item.</p>
        </>
      )}
    </MemoDialog>
  );
}

// Trash icon on the client's own unanswered memo, with a confirm step.
export function DeleteMemoButton({ memoId, action }: { memoId: string; action: Action }) {
  const [confirming, setConfirming] = useState(false);
  const remove = useSaveAction(action, () => setConfirming(false));

  return (
    <>
      <button
        type="button"
        aria-label="Delete memo"
        onClick={() => setConfirming(true)}
        className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-card hover:text-foreground"
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
      <StatusDialog
        open={confirming || remove.failed}
        title={remove.failed ? "Your memo wasn't deleted" : "Delete this memo?"}
        body={remove.failed ? "Please try again." : "Your case team hasn't replied yet. Deleting removes it for them too."}
        onClose={() => {
          setConfirming(false);
          remove.dismiss();
        }}
      >
        <button
          type="button"
          disabled={remove.pending}
          onClick={() => {
            const formData = new FormData();
            formData.append("memoId", memoId);
            remove.run(formData);
          }}
          className={DIALOG_PRIMARY}
        >
          {remove.pending ? "Deleting..." : remove.failed ? "Try again" : "Delete"}
        </button>
        <button
          type="button"
          onClick={() => {
            setConfirming(false);
            remove.dismiss();
          }}
          className={DIALOG_SECONDARY}
        >
          Keep memo
        </button>
      </StatusDialog>
    </>
  );
}
