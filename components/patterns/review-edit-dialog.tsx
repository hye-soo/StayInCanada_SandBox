"use client";

import { useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { IntakeCategoryId } from "@/lib/data/intake-steps.ts";
import { getCategorySteps, getMissingFields, pickStepForm, type IntakeAnswers } from "@/lib/intake.ts";
import { Icon } from "@/components/ui/icon";
import { StepFields } from "@/components/patterns/step-fields";
import { DIALOG_PRIMARY, DIALOG_SECONDARY, StatusDialog } from "@/components/patterns/status-dialog";
import { useSaveAction } from "@/components/patterns/use-save-action";

interface ReviewEditDialogProps {
  categoryId: IntakeCategoryId;
  label: string;
  answers: IntakeAnswers;
  action: (formData: FormData) => Promise<void>;
}

// Figma "Edit answers / <section>": the review's "Edit <section>" link
// opens every question of that section in a dialog, one column, saved
// together with "Save & return to review".
export function ReviewEditDialog({ categoryId, label, answers, action }: ReviewEditDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  // Bumped on every open, so Cancel throws away unsaved edits.
  const [version, setVersion] = useState(0);
  const save = useSaveAction(action, () => dialog.current?.close());
  const steps = getCategorySteps(categoryId);

  function open() {
    setErrors(new Set());
    setVersion((current) => current + 1);
    dialog.current?.showModal();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const missing = steps.flatMap((step) =>
      getMissingFields(step, pickStepForm(formData, `${step.id}__`)).map((name) => `${step.id}__${name}`)
    );
    setErrors(new Set(missing));
    if (missing.length > 0) {
      document.getElementById(missing[0]!)?.focus();
      return;
    }
    save.run(formData);
  }

  function clearError(event: FormEvent<HTMLFormElement>) {
    const name = (event.target as HTMLInputElement).name;
    if (errors.has(name)) setErrors((current) => new Set([...current].filter((item) => item !== name)));
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="flex h-20 items-center gap-1.5 px-6 text-base font-semibold text-primary hover:underline"
      >
        Edit {label.toLowerCase()}
        <Icon src="/icons/arrow-up-right.svg" className="size-3.5" />
      </button>

      <dialog
        ref={dialog}
        aria-labelledby={`edit-${categoryId}-title`}
        className="m-auto w-[min(560px,calc(100vw-2rem))] max-h-[calc(100dvh-4rem)] overflow-hidden rounded-xl bg-card p-0 text-foreground shadow-card backdrop:bg-navy/50"
      >
        <form key={version} onSubmit={handleSubmit} onChange={clearError} noValidate className="flex max-h-[calc(100dvh-4rem)] flex-col">
          <input type="hidden" name="section" value={categoryId} />
          <header className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
            <div className="flex flex-col gap-1">
              <h2 id={`edit-${categoryId}-title`} className="text-lg font-semibold">
                Edit {label.toLowerCase()}
              </h2>
              <p className="text-xs text-muted-foreground">Update your answers, then return to your review.</p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => dialog.current?.close()}
              className="flex size-8 items-center justify-center rounded-full hover:bg-secondary"
            >
              <X className="size-4" />
            </button>
          </header>

          <div className="flex flex-col gap-4 overflow-y-auto px-6 pb-6">
            {steps.map((step) => (
              <section key={step.id} className="flex flex-col gap-4">
                {steps.length > 1 ? (
                  <h3 className="pt-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{step.title}</h3>
                ) : null}
                <StepFields step={step} answer={answers[step.id]} prefix={`${step.id}__`} errors={errors} singleColumn />
              </section>
            ))}
          </div>

          <footer className="flex items-center gap-6 border-t border-border px-6 py-4">
            <button
              type="submit"
              disabled={save.pending}
              className="h-10 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              Save &amp; return to review
            </button>
            <button type="button" onClick={() => dialog.current?.close()} className="text-sm font-semibold text-primary hover:underline">
              Cancel
            </button>
          </footer>
        </form>
      </dialog>

      <StatusDialog
        open={save.pending}
        title="Saving your progress..."
        body="Please wait while we save your latest answers."
      />
      <StatusDialog
        open={save.failed}
        title="Your progress couldn't be saved"
        body="Your answers are still on this screen. Try again before leaving."
        onClose={save.dismiss}
      >
        <button type="button" onClick={save.retry} className={DIALOG_PRIMARY}>
          Try again
        </button>
        <button type="button" onClick={save.dismiss} className={DIALOG_SECONDARY}>
          Keep working
        </button>
      </StatusDialog>
    </>
  );
}
