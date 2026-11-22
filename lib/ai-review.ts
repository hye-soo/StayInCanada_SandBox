import type { ChecklistItem } from "./types.ts";

// Figma "AI Review Assistant": an automatic check on every uploaded
// document. AI only points things out and drafts a message; staff
// decide every outcome (confirm / dismiss a finding, request changes,
// approve).
export type AiCheckStatus = "checking" | "issue" | "clean" | "failed";

export interface AiFinding {
  title: string;
  detail: string;
  // Where on the file, e.g. "Page 1" and the field it concerns.
  page: string;
  field: string;
}

export interface AiCheck {
  status: AiCheckStatus;
  findings: AiFinding[];
  intakeComparison?: string;
  // On a replacement: what happened to the area flagged last time.
  resolved?: string;
  // Suggested message to the client when staff request changes.
  draftMessage?: string;
}

export const AI_CHECK_LABEL: Record<AiCheckStatus, string> = {
  checking: "Checking…",
  issue: "possible issue",
  clean: "No issues detected",
  failed: "Couldn’t check",
};

export function aiCheckLabel(check: AiCheck): string {
  if (check.status !== "issue") return AI_CHECK_LABEL[check.status];
  const count = check.findings.length;
  return `${count} possible issue${count === 1 ? "" : "s"}`;
}

// Version shown to staff: v2 once a flagged upload has been replaced.
export function documentVersion(item: ChecklistItem): number {
  return item.previousUpload ? 2 : 1;
}

// ponytail: simulated AI, same answer every time so the demo can be
// recorded again. Swap this one function for a real model call (send the
// uploaded file + intake, get findings back) when there's a backend.
const DEMO_STATUS: Record<string, AiCheckStatus> = {
  "client-jordan-lee/proof-of-funds": "checking",
  "client-riley-singh/letter-of-acceptance": "failed",
  "client-taylor-morgan/passport": "clean",
};

export function runAiCheck(clientId: string, item: ChecklistItem): AiCheck {
  const demo = DEMO_STATUS[`${clientId}/${item.id}`];
  if (demo === "checking" || demo === "failed") return { status: demo, findings: [] };

  if (item.id === "passport" && demo !== "clean") {
    if (item.previousUpload) {
      return {
        status: "clean",
        findings: [],
        resolved: "The full expiry date is now visible on page 1.",
        intakeComparison: "Name and date of birth match the intake.",
      };
    }
    return {
      status: "issue",
      findings: [
        {
          title: "Possible cropped content",
          detail: "The expiry date may be cut off at the bottom of page 1.",
          page: "Page 1 · Highlighted on the preview",
          field: "Expiry date field",
        },
      ],
      intakeComparison: "Name and date of birth match the intake. Expiry date could not be fully read.",
      draftMessage: "The expiry date is cut off. Please upload a clear image of the full passport photo page.",
    };
  }

  return { status: "clean", findings: [], intakeComparison: "Details match the intake." };
}

// Staff decisions on a finding, per uploaded file (a new upload starts
// fresh), plus who approved a document.
export type FindingDecision = "confirmed" | "dismissed";

// Demo only: force the queue's AI orb to look busy or idle for a recording.
export type AiOrbMode = "auto" | "working" | "idle";

export interface AiReviewStore {
  orbMode: AiOrbMode;
  getDecision(clientId: string, itemId: string, fileName: string): FindingDecision | undefined;
  decide(clientId: string, itemId: string, fileName: string, decision: FindingDecision): void;
  getApproval(clientId: string, itemId: string): { by: string; at: number } | undefined;
  approve(clientId: string, itemId: string, by: string, at?: number): void;
  latestApproval(): { clientId: string; itemId: string; by: string; at: number } | undefined;
}

class InMemoryAiReviewStore implements AiReviewStore {
  orbMode: AiOrbMode = "auto";
  private readonly decisions = new Map<string, FindingDecision>();
  private readonly approvals = new Map<string, { clientId: string; itemId: string; by: string; at: number }>();

  getDecision(clientId: string, itemId: string, fileName: string) {
    return this.decisions.get(`${clientId}/${itemId}/${fileName}`);
  }

  decide(clientId: string, itemId: string, fileName: string, decision: FindingDecision) {
    this.decisions.set(`${clientId}/${itemId}/${fileName}`, decision);
  }

  getApproval(clientId: string, itemId: string) {
    return this.approvals.get(`${clientId}/${itemId}`);
  }

  approve(clientId: string, itemId: string, by: string, at = Date.now()) {
    this.approvals.set(`${clientId}/${itemId}`, { clientId, itemId, by, at });
  }

  latestApproval() {
    return [...this.approvals.values()].sort((a, b) => b.at - a.at)[0];
  }
}

// On globalThis like the memo store: demo actions and pages are bundled
// apart in dev and would otherwise each get their own copy.
const holder = globalThis as typeof globalThis & { __flowouiAiReview?: AiReviewStore };

export function getAiReviewStore(): AiReviewStore {
  if (!(holder.__flowouiAiReview instanceof InMemoryAiReviewStore)) holder.__flowouiAiReview = new InMemoryAiReviewStore();
  return holder.__flowouiAiReview;
}

// Demo only: forget every decision.
export function resetAiReviewStore(): void {
  holder.__flowouiAiReview = undefined;
}
