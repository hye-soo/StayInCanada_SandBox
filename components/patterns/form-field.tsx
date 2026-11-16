import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFieldProps extends ComponentProps<"input"> {
  name: string;
  label: string;
  hint?: string;
  error?: string;
}

// Label (with optional inline hint) above the input, error below it,
// both wired to the input via aria-describedby.
export function FormField({ name, id, label, hint, error, ...inputProps }: FormFieldProps) {
  const fieldId = id ?? name;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={fieldId}>
        {label}
        {hint ? <span id={hintId}> — {hint}</span> : null}
      </Label>
      <Input
        id={fieldId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {/* Figma: the error line sits in the 24px gap below the field
          (forms use gap-6), so showing it doesn't push the form down. */}
      {error ? (
        <p id={errorId} className="-mt-2 -mb-6 px-4 text-xs font-medium leading-6 text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
