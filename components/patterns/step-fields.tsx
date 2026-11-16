"use client";

import { useState, type ReactNode } from "react";
import { cn } from "cn";
import type { IntakeField, IntakeStep } from "@/lib/data/intake-steps.ts";
import { isFieldDisabled, type StepAnswer } from "@/lib/intake.ts";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const INPUT_TYPE: Partial<Record<IntakeField["type"], string>> = {
  email: "email",
  tel: "tel",
  date: "date",
  month: "month",
};

export const REQUIRED_MESSAGE = "This answer is required.";

function FieldControl({
  field,
  name,
  value,
  disabled,
  invalid,
  onChange,
}: {
  field: Pick<IntakeField, "type" | "placeholder" | "options">;
  name: string;
  value?: string;
  disabled?: boolean;
  invalid?: boolean;
  onChange?: (value: string) => void;
}) {
  const common = {
    id: name,
    name,
    disabled,
    "aria-invalid": invalid || undefined,
    "aria-describedby": invalid ? `${name}-error` : undefined,
  };
  const placeholder = disabled ? "Not required" : field.placeholder;

  // Figma "CIF Complete": Yes/No questions are a dropdown like any select.
  if (field.type === "yesNo" || field.type === "select") {
    const options =
      field.type === "yesNo"
        ? [
            ["yes", "Yes"],
            ["no", "No"],
          ]
        : (field.options ?? []).map((o) => [o, o]);
    return (
      <Select
        {...common}
        defaultValue={value ?? ""}
        onChange={(event) => onChange?.(event.target.value)}
        className={cn(disabled && "opacity-50")}
      >
        <option value="">
          {field.type === "yesNo" ? "Yes / No" : (placeholder ?? "Select")}
        </option>
        {options.map(([optionValue, label]) => (
          <option key={optionValue} value={optionValue}>
            {label}
          </option>
        ))}
      </Select>
    );
  }
  if (field.type === "textarea") {
    return (
      <Textarea
        {...common}
        defaultValue={value}
        placeholder={placeholder}
        className="min-h-24 rounded-3xl bg-card px-4 py-3 text-base md:text-base aria-invalid:border-coral aria-invalid:ring-0 disabled:bg-muted"
      />
    );
  }
  return (
    <Input
      {...common}
      defaultValue={value}
      type={INPUT_TYPE[field.type] ?? "text"}
      placeholder={placeholder}
      className={cn(disabled && "opacity-50")}
    />
  );
}

function Field({
  label,
  required,
  error,
  wide,
  children,
  name,
  disabled,
}: {
  label: string;
  required?: boolean;
  error?: string;
  wide?: boolean;
  disabled?: boolean;
  children: ReactNode;
  name: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", wide && "sm:col-span-2")}>
      <Label htmlFor={name} className={cn(disabled && "text-muted-foreground")}>
        {label}
        {required ? " *" : ""}
      </Label>
      {children}
      {error ? (
        <p
          id={`${name}-error`}
          className="text-base leading-[1.4] text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface StepFieldsProps {
  step: IntakeStep;
  answer?: StepAnswer;
  // Prepended to every input name, so several steps can share one form
  // (the review's "Edit <section>" dialog uses "<stepId>__").
  prefix?: string;
  errors: ReadonlySet<string>;
  singleColumn?: boolean;
  onGateChange?: (value: string) => void;
}

// One step's questions: a plain step's fields (dependent ones greyed out
// until allowed), or a gate / repeatable step's numbered entries with
// "Add another entry". Shared by the question screen and the review dialog.
export function StepFields({ step, answer, prefix = "", errors, singleColumn, onGateChange }: StepFieldsProps) {
  const values = answer?.values ?? {};
  const [gate, setGate] = useState(step.gate ? values[step.gate.name] : undefined);
  const [entryCount, setEntryCount] = useState(Math.max(answer?.entries?.length ?? 0, 1));
  // Live dropdown answers, so dependent fields grey out as soon as
  // their controlling answer rules them out (Single, No).
  const [answers, setAnswers] = useState<Record<string, string | undefined>>(values);
  const entriesOpen = step.repeatable || gate === "yes";
  const grid = cn("grid grid-cols-1 gap-x-4 gap-y-4", !singleColumn && "sm:grid-cols-2");
  const error = (name: string) => (errors.has(name) ? REQUIRED_MESSAGE : undefined);

  if (step.gate || step.repeatable) {
    return (
      <>
        {step.gate ? (
          <Field label={step.gate.question} required name={prefix + step.gate.name} error={error(prefix + step.gate.name)}>
            <FieldControl
              field={{ type: "yesNo" }}
              name={prefix + step.gate.name}
              value={gate}
              invalid={errors.has(prefix + step.gate.name)}
              onChange={(value) => {
                setGate(value);
                onGateChange?.(value);
              }}
            />
          </Field>
        ) : null}
        {Array.from({ length: entryCount }, (_, index) => (
          <fieldset key={index} disabled={!entriesOpen} className={cn(grid, index > 0 && "border-t border-border pt-4")}>
            {entryCount > 1 ? (
              <legend className="mb-1 text-sm font-medium text-muted-foreground">Entry {index + 1}</legend>
            ) : null}
            {step.fields.map((field) => {
              const name = `${prefix}entry-${index}-${field.name}`;
              return (
                <Field key={field.name} label={field.label} required={field.required} name={name} disabled={!entriesOpen} error={error(name)}>
                  <FieldControl
                    field={field}
                    name={name}
                    value={answer?.entries?.[index]?.[field.name]}
                    disabled={!entriesOpen}
                    invalid={errors.has(name)}
                  />
                </Field>
              );
            })}
          </fieldset>
        ))}
        {entriesOpen ? (
          <button
            type="button"
            onClick={() => setEntryCount((count) => count + 1)}
            className="flex h-12 w-60 items-center gap-2 rounded-md p-3 text-sm font-semibold text-primary hover:bg-secondary"
          >
            <Icon src="/icons/plus-small.svg" className="size-6" />
            Add another entry
          </button>
        ) : null}
      </>
    );
  }

  return (
    <div className={grid}>
      {step.fields.map((field, index) => {
        const disabled = isFieldDisabled(field, answers);
        const name = prefix + field.name;
        return (
          <Field
            key={field.name}
            label={field.label}
            required={field.required}
            name={name}
            wide={index === 0 && !step.pairAll && !singleColumn}
            disabled={disabled}
            error={error(name)}
          >
            <FieldControl
              field={field}
              name={name}
              value={values[field.name]}
              disabled={disabled}
              invalid={errors.has(name)}
              onChange={(value) => setAnswers((current) => ({ ...current, [field.name]: value }))}
            />
          </Field>
        );
      })}
    </div>
  );
}
