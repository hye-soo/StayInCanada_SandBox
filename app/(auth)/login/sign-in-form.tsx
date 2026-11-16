"use client";

import { useActionState } from "react";
import { FormField } from "@/components/patterns/form-field";
import { Button } from "@/components/ui/button";
import { signIn, type SignInState } from "./actions.ts";

const INITIAL_STATE: SignInState = { email: "", errors: {} };
const SUPPORT_EMAIL = "FlowOui@example.com";

export function SignInForm() {
  const [state, formAction, pending] = useActionState(signIn, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <FormField
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        placeholder="name@example.com"
        required
        defaultValue={state.email}
        error={state.errors.email}
      />
      <FormField
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        required
        error={state.errors.password}
      />
      <div className="mt-6 flex flex-col">
        <Button type="submit" disabled={pending} className="h-12 w-full rounded-full font-semibold">
          {pending ? "Logging in..." : "Login"}
        </Button>
        <p className="flex min-h-12 items-center justify-center text-center text-sm font-semibold text-foreground">
          <span>
            Haven&apos;t gotten any invitation? Contact us at{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </span>
        </p>
      </div>
    </form>
  );
}
