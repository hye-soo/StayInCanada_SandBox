"use client";

import { useState, type FormEvent } from "react";
import { cn } from "cn";
import type { IntakeStep } from "@/lib/data/intake-steps.ts";
import { getMissingFields, type StepAnswer } from "@/lib/intake.ts";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { StepFields } from "@/components/patterns/step-fields";
import { DIALOG_PRIMARY, DIALOG_SECONDARY, StatusDialog } from "@/components/patterns/status-dialog";
import { useSaveAction } from "@/components/patterns/use-save-action";

const SECONDARY_BUTTON =
  "h-12 rounded-full border border-input bg-secondary px-6 text-sm font-semibold text-foreground hover:bg-secondary/70";

interface IntakeStepFormProps {
  step: IntakeStep;
  answer?: StepAnswer;
  action: (formData: FormData) => Promise<void>;
  isFirst: boolean;
}

// Figma "CIF Complete" question card: first field full width, the rest
// in two columns, then Additional notes, "Why we ask" and the actions.
export function IntakeStepForm({
  step,
  answer,
  action,
  isFirst,
}: IntakeStepFormProps) {
  const [gate, setGate] = useState(step.gate ? answer?.values[step.gate.name] : undefined);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const gateIsNo = gate === "no";
  const save = useSaveAction(action);

  // "Save & continue" checks required answers in the browser first (Figma
  // "Form validation / Required answer"); "Save & exit" and "Previous"
  // still save a partial draft.
  // Every save shows "Saving your progress..." and, if it fails, offers
  // a retry with the answers still on screen.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    const formData = new FormData(event.currentTarget, submitter);
    if (submitter?.value === "continue") {
      const missing = getMissingFields(step, formData);
      setErrors(new Set(missing));
      if (missing.length > 0) {
        document.getElementById(missing[0]!)?.focus();
        return;
      }
    }
    save.run(formData);
  }

  function clearError(event: FormEvent<HTMLFormElement>) {
    const name = (event.target as HTMLInputElement).name;
    if (errors.has(name))
      setErrors(
        (current) => new Set([...current].filter((item) => item !== name)),
      );
  }

  const why = gateIsNo && step.gate ? step.gate.whyIfNo : step.whyWeAsk;
  const careful =
    gateIsNo && step.gate ? step.gate.carefulIfNo : step.beCareful;

  return (
    <form
      onSubmit={handleSubmit}
      onChange={clearError}
      noValidate
      className="flex flex-col gap-6"
    >
      <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-foreground">
            {step.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {step.gate ? "Answer the questions below." : "Complete this step."}{" "}
            Fields marked * are required when applicable.
          </p>
        </div>

        <StepFields step={step} answer={answer} errors={errors} onGateChange={setGate} />

        <aside className="flex gap-3 rounded-lg border border-border bg-secondary px-6 py-6">
          <Icon
            src="/icons/exclamation.svg"
            className="mt-px size-6 text-foreground"
          />
          <div className="flex flex-col gap-1.5">
            <h3 className="text-base font-medium text-foreground">
              Why we ask
            </h3>
            <p className="text-sm text-foreground">{why}</p>
            {careful ? (
              <p className="text-sm text-foreground">Be careful: {careful}</p>
            ) : null}
          </div>
        </aside>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="submit"
          name="intent"
          value="exit"
          className={cn(SECONDARY_BUTTON, "w-[203px]")}
        >
          Save &amp; exit
        </button>
        <div className="flex flex-wrap gap-4">
          {!isFirst ? (
            <button
              type="submit"
              name="intent"
              value="previous"
              className={SECONDARY_BUTTON}
            >
              Previous step
            </button>
          ) : null}
          <Button
            type="submit"
            name="intent"
            value="continue"
            className="h-12 w-60 rounded-full font-semibold"
          >
            Save &amp; continue
          </Button>
        </div>
      </div>

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
    </form>
  );
}
