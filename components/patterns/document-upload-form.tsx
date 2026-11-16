"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import Link from "next/link";
import { CloudUpload, X } from "lucide-react";
import { cn } from "cn";
import { formatFileSize as formatSize, validateUploadFile } from "@/lib/upload-validation.ts";
import { DIALOG_PRIMARY, DIALOG_SECONDARY, StatusDialog } from "@/components/patterns/status-dialog";
import { useSaveAction } from "@/components/patterns/use-save-action";

const PRIMARY = "h-10 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90";
const SECONDARY = "h-10 rounded-full border border-input bg-secondary px-6 text-sm font-semibold text-foreground hover:bg-secondary/70";

export function FileCard({ name, meta, children }: { name: string; meta: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 rounded-lg bg-secondary px-3 py-3">
      <span className="flex h-11 w-9 shrink-0 items-center justify-center rounded bg-coral/15 text-xs font-medium text-coral">PDF</span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-base font-medium text-foreground">{name}</span>
        <span className="text-[13px] text-muted-foreground">{meta}</span>
      </span>
      {children}
    </div>
  );
}

// Figma "Upload flow" 01-04: choose a file (button or drag and drop),
// see it ready to submit, an "Uploading..." bar while it's sent, and
// "This file couldn't be added" when it's not a PDF or over 4 MB.
export function DocumentUploadForm({
  action,
  initialError,
}: {
  action: (formData: FormData) => Promise<void>;
  initialError?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | undefined>(initialError);
  const [progress, setProgress] = useState(0);
  const upload = useSaveAction(action);

  // ponytail: simulated progress; the server action reports no progress.
  // Swap for real upload events once files go to storage.
  useEffect(() => {
    if (!upload.pending) return;
    const timer = setInterval(() => setProgress((value) => Math.min(92, value + 9)), 180);
    return () => clearInterval(timer);
  }, [upload.pending]);

  function pick(chosen: File | undefined) {
    if (!chosen) return;
    const problem = validateUploadFile(chosen);
    setError(problem);
    setFile(problem ? null : chosen);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    pick(event.dataTransfer.files[0]);
  }

  function submit() {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setProgress(8);
    upload.run(formData);
  }

  const chooseAnother = (
    <button type="button" onClick={() => input.current?.click()} className={cn(error ? PRIMARY : SECONDARY, "self-start")}>
      Choose another file
    </button>
  );

  return (
    <div className="flex flex-1 flex-col gap-6">
      <h2 className="text-lg font-semibold text-foreground">
        {upload.pending ? "Uploading your document" : "Upload your document"}
      </h2>
      <input
        ref={input}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          pick(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {error ? (
        <>
          <div role="alert" className="flex flex-col gap-3 rounded-lg border border-coral bg-coral/10 px-5 py-4">
            <p className="flex items-center gap-3 text-base font-semibold text-destructive">
              <span aria-hidden className="text-xl font-bold">!</span>
              This file couldn&apos;t be added
            </p>
            <p className="text-sm text-foreground">{error}</p>
          </div>
          {chooseAnother}
        </>
      ) : file ? (
        <>
          <FileCard
            name={file.name}
            meta={upload.pending ? `PDF · ${formatSize(file.size)}` : `${formatSize(file.size)} • Ready to submit`}
          >
            {upload.pending ? null : (
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => setFile(null)}
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-card"
              >
                <X className="size-4" />
              </button>
            )}
          </FileCard>
          {upload.pending ? (
            <div className="flex flex-col gap-2">
              <div className="h-2 overflow-hidden rounded-full bg-track">
                <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-sm text-muted-foreground" aria-live="polite">
                Uploading... {progress}%
              </p>
            </div>
          ) : (
            chooseAnother
          )}
        </>
      ) : (
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
          className="flex flex-col items-center gap-1 rounded-lg border border-icon-muted bg-mist px-6 py-10 text-center"
        >
          <CloudUpload className="size-9 text-foreground" strokeWidth={1.5} aria-hidden />
          <p className="mt-3 text-lg font-semibold text-foreground">Choose a file to upload</p>
          <p className="text-xs text-muted-foreground">Add a file from your device.</p>
          <button type="button" onClick={() => input.current?.click()} className={cn(PRIMARY, "mt-5 px-12")}>
            Choose file
          </button>
          <p className="mt-3 text-xs text-muted-foreground">PDF · Maximum 4 MB</p>
        </div>
      )}

      {upload.pending ? null : (
        <div className="mt-auto flex flex-wrap gap-4 pt-10">
          <button
            type="button"
            onClick={submit}
            disabled={!file}
            className={cn(PRIMARY, "w-[190px] disabled:cursor-not-allowed disabled:bg-filter disabled:hover:bg-filter")}
          >
            Submit document
          </button>
          <Link href="/checklist" className={cn(SECONDARY, "flex w-[150px] items-center justify-center")}>
            Cancel
          </Link>
        </div>
      )}

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
    </div>
  );
}
