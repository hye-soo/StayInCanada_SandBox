"use client";

import { ArrowDown } from "lucide-react";

// ponytail: "Download PDF" opens the browser's print dialog (Save as PDF);
// print styles leave only the document. Swap for a generated PDF file
// once there's a backend to render one.
export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex h-10 items-center gap-1.5 rounded-full bg-primary px-10 text-sm font-semibold text-primary-foreground hover:bg-primary/90 print:hidden"
    >
      {label}
      <ArrowDown className="size-3.5" aria-hidden />
    </button>
  );
}
