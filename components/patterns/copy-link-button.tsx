"use client";

import { useState } from "react";
import { cn } from "cn";

// Copies an app path as a full link (e.g. an invitation) and says so.
export function CopyLinkButton({ path, className, label = "Copy link" }: { path: string; className?: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(new URL(path, window.location.origin).toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" onClick={copy} className={cn("text-sm font-semibold text-primary hover:underline", className)}>
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}
