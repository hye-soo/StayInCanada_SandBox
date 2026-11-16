"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import { FormField } from "@/components/patterns/form-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MIN_PASSWORD_LENGTH, validateAccountForm, type AccountFormErrors } from "@/lib/account-validation.ts";
import { acceptInvite, type AcceptInviteState } from "./actions.ts";

interface AcceptInviteFormProps {
  token: string;
  email: string;
  name: string;
}

export function AcceptInviteForm({ token, email, name }: AcceptInviteFormProps) {
  const [state, formAction, pending] = useActionState(acceptInvite, {
    name,
    errors: {},
  } satisfies AcceptInviteState);
  const [clientErrors, setClientErrors] = useState<AccountFormErrors>({});

  // Check in the browser first: a form action resets every field once
  // the server answers, so a server-side rejection would wipe the typed
  // passwords. Blocking the submit here keeps them. The server still
  // re-validates.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const found = validateAccountForm({
      name: String(data.get("name") ?? "").trim(),
      password: String(data.get("password") ?? ""),
      confirmPassword: String(data.get("confirmPassword") ?? ""),
      acceptedTerms: data.get("acceptedTerms") === "on",
    });
    setClientErrors(found);
    if (Object.keys(found).length > 0) event.preventDefault();
  }

  const errors: AcceptInviteState["errors"] = Object.keys(clientErrors).length > 0 ? clientErrors : state.errors;

  return (
    <form action={formAction} onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <input type="hidden" name="token" value={token} />
      <FormField
        name="name"
        label="Full name"
        autoComplete="name"
        required
        defaultValue={state.name}
        error={errors.name}
      />
      <FormField
        name="email"
        type="email"
        label="Email address"
        hint="This invitation is linked to your email address"
        value={email}
        readOnly
      />
      <FormField
        name="password"
        type="password"
        label="Password"
        hint={`Use at least ${MIN_PASSWORD_LENGTH} characters`}
        autoComplete="new-password"
        minLength={MIN_PASSWORD_LENGTH}
        required
        error={errors.password}
      />
      <FormField
        name="confirmPassword"
        type="password"
        label="Confirm password"
        autoComplete="new-password"
        required
        error={errors.confirmPassword}
      />

      <div className="-mt-4 flex flex-col gap-1 px-2">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox
            name="acceptedTerms"
            aria-invalid={errors.acceptedTerms ? true : undefined}
            aria-describedby={errors.acceptedTerms ? "acceptedTerms-error" : undefined}
          />
          I agree to the terms and privacy notice.
        </label>
        {errors.acceptedTerms ? (
          <p id="acceptedTerms-error" className="text-xs font-medium text-destructive">
            {errors.acceptedTerms}
          </p>
        ) : null}
      </div>

      {errors.form ? (
        <p role="alert" className="text-sm text-destructive">
          {errors.form}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col">
        <Button type="submit" disabled={pending} className="h-12 w-full rounded-full font-semibold">
          {pending ? "Creating account..." : "Create account & continue"}
        </Button>
        <Link
          href="/login"
          className="flex min-h-12 items-center justify-center text-sm font-semibold text-foreground hover:underline"
        >
          Already have an account? Sign in
        </Link>
      </div>
    </form>
  );
}
