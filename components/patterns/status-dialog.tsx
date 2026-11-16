"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface StatusDialogProps {
  open: boolean;
  title: string;
  body: string;
  // Buttons under the text; none for a "please wait" state.
  children?: ReactNode;
  // Esc / backdrop: allowed only when there's something to close.
  onClose?: () => void;
}

// Figma "Additional states": the small white dialog over a dimmed screen
// for Saving / Submitting (no buttons, can't be dismissed) and for the
// "couldn't be saved / wasn't submitted" retries.
export function StatusDialog({ open, title, body, children, onClose }: StatusDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        onClose?.();
      }}
      className="m-auto w-[min(460px,calc(100vw-2rem))] rounded-xl bg-card p-5 text-foreground shadow-card backdrop:bg-navy/50"
    >
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{body}</p>
        {children ? <div className="mt-2 flex flex-wrap items-center gap-3">{children}</div> : null}
      </div>
    </dialog>
  );
}

export const DIALOG_PRIMARY =
  "h-10 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground hover:bg-primary/90";
export const DIALOG_SECONDARY =
  "h-10 rounded-full border border-border bg-card px-5 text-sm font-semibold text-primary hover:bg-secondary";
