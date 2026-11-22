"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { validateUploadFile } from "@/lib/upload-validation.ts";
import { DIALOG_PRIMARY, DIALOG_SECONDARY, StatusDialog } from "@/components/patterns/status-dialog";
import { useSaveAction } from "@/components/patterns/use-save-action";

const PRIMARY =
  "flex h-[42px] items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50";
const SECONDARY =
  "flex h-[42px] items-center justify-center rounded-md border border-border bg-card px-6 text-sm font-semibold text-primary hover:bg-secondary";

// Figma "AI Review Assistant" 07: "Upload replacement" opens a small
// dialog with the chosen file, then "Submit replacement" sends it.
export function UploadReplacementDialog({
  action,
  itemLabel,
  initialError,
}: {
  action: (formData: FormData) => Promise<void>;
  itemLabel: string;
  initialError?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | undefined>(initialError);
  const upload = useSaveAction(action);

  function pick(chosen: File | undefined) {
    if (!chosen) return;
    const problem = validateUploadFile(chosen);
    setError(problem);
    setFile(problem ? null : chosen);
  }

  function submit() {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    upload.run(formData);
  }

  return (
    <>
      <button type="button" onClick={() => dialog.current?.showModal()} className={`${PRIMARY} w-[260px]`}>
        Upload replacement
      </button>
      {error && !file ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <dialog
        ref={dialog}
        aria-label="Upload replacement"
        className="m-auto w-[min(450px,calc(100vw-2rem))] rounded-xl bg-card p-5 text-foreground shadow-card backdrop:bg-navy/50"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold">Upload replacement</h2>
              <p className="text-sm text-muted-foreground">{itemLabel}</p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => dialog.current?.close()}
              className="flex size-8 items-center justify-center rounded-full hover:bg-secondary"
            >
              <X className="size-4" />
            </button>
          </div>

          <input
            ref={input}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(event) => pick(event.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="flex flex-col items-start gap-1 rounded-md bg-secondary px-3 py-3 text-left hover:bg-secondary/70"
          >
            <span className="text-[11px] tracking-wide text-muted-foreground">SELECTED FILE</span>
            <span className="text-sm font-semibold">{file ? file.name : "Choose a PDF (max 4 MB)"}</span>
          </button>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <p className="text-sm text-foreground">This version will appear in your case team&apos;s review queue.</p>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => dialog.current?.close()} className={`${SECONDARY} w-[132px]`}>
              Cancel
            </button>
            <button type="button" disabled={!file || upload.pending} onClick={submit} className={`${PRIMARY} w-[200px]`}>
              Submit replacement
            </button>
          </div>
        </div>
      </dialog>

      <StatusDialog open={upload.pending} title="Uploading..." body="Please wait while we send your file to your case team." />
      <StatusDialog
        open={upload.failed}
        title="Your document wasn't uploaded"
        body="Your file is still selected. Please try again."
        onClose={upload.dismiss}
      >
        <button type="button" onClick={upload.retry} className={DIALOG_PRIMARY}>
          Try again
        </button>
        <button type="button" onClick={upload.dismiss} className={DIALOG_SECONDARY}>
          Keep editing
        </button>
      </StatusDialog>
    </>
  );
}
