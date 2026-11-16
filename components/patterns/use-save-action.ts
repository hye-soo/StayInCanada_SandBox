"use client";

import { useRef, useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";

// Runs a server action with a "pending" flag for the Saving / Submitting
// dialog and a "failed" flag (network or server error) for the retry
// dialog. Redirects from the action pass straight through.
export function useSaveAction(
  action: (formData: FormData) => Promise<unknown> | void,
  // Runs after a save that didn't redirect (e.g. close the edit dialog).
  onSuccess?: () => void
) {
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
  const last = useRef<FormData | null>(null);

  function run(formData: FormData) {
    last.current = formData;
    setFailed(false);
    startTransition(async () => {
      try {
        await action(formData);
        onSuccess?.();
      } catch (error) {
        unstable_rethrow(error);
        setFailed(true);
      }
    });
  }

  return {
    pending,
    failed,
    run,
    retry: () => (last.current ? run(last.current) : undefined),
    dismiss: () => setFailed(false),
  };
}
