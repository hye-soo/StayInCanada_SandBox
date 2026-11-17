"use client";

import { useRef } from "react";
import type { ReviewRow } from "@/lib/intake.ts";
import { Icon } from "@/components/ui/icon";

interface IntakeAnswersDialogProps {
  clientName: string;
  sectionLabel: string;
  groups: { stepId: string; title: string; rows: ReviewRow[] }[];
}

// Figma "All clients_Profile_Intake_Personal details / Staff": a
// reviewed section's answers in a read-only dialog over the intake list.
export function IntakeAnswersDialog({ clientName, sectionLabel, groups }: IntakeAnswersDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        View answers
        <Icon src="/icons/arrow-up-right.svg" className="size-[15px]" />
      </button>
      <dialog
        ref={dialog}
        aria-label={`${clientName} · ${sectionLabel}`}
        className="m-auto w-[min(520px,calc(100vw-2rem))] max-h-[calc(100dvh-4rem)] rounded-2xl bg-card p-0 text-foreground shadow-card backdrop:bg-navy/50"
      >
        <div className="flex max-h-[calc(100dvh-4rem)] flex-col">
          <div className="flex flex-col gap-1 px-6 pt-6 pb-3">
            <p className="text-xs text-muted-foreground">{clientName} · Intake</p>
            <h2 className="text-xl font-semibold">{sectionLabel}</h2>
          </div>
          <dl className="flex flex-col gap-4 overflow-y-auto px-6 pb-2">
            {groups.map((group) => (
              <div key={group.stepId} className="flex flex-col gap-3">
                {groups.length > 1 ? (
                  <p className="pt-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{group.title}</p>
                ) : null}
                {group.rows.map((row, index) => (
                  <div key={index} className="flex flex-col gap-0.5">
                    <dt className="text-sm text-foreground">{row.label}</dt>
                    <dd className={row.value.startsWith("Not provided") ? "text-sm text-muted-foreground" : "text-sm font-semibold"}>
                      {row.value}
                    </dd>
                  </div>
                ))}
              </div>
            ))}
          </dl>
          <div className="px-6 pt-3 pb-6">
            <button
              type="button"
              autoFocus
              onClick={() => dialog.current?.close()}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
