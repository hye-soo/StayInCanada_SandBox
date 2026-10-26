"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { applySubmissionAction } from "@/lib/apply-submission-action.ts";
import { requireRole } from "@/lib/firebase/session.ts";

function refreshViews(clientId: string) {
  revalidatePath(`/rcic/${clientId}/validation`);
  revalidatePath(`/rcic/${clientId}`);
  revalidatePath(`/admin/${clientId}`);
  revalidatePath("/rcic");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

async function actorName() {
  const session = await requireRole(["rcic"]);
  return session.displayName || session.email || "RCIC";
}

// R01: RCIC's holistic sign-off once every checklist item is
// individually approved — stacks on top of, doesn't replace, the
// existing per-item approve/request-changes.
export async function validateRequirements(clientId: string, formData: FormData) {
  const name = await actorName();
  const note = String(formData.get("note") ?? "").trim() || undefined;
  const result = applySubmissionAction(clientId, { type: "validate", note }, name);

  if (result.error) {
    redirect(`/rcic/${clientId}/validation?error=${encodeURIComponent(result.error)}`);
  }
  refreshViews(clientId);
  redirect(`/rcic/${clientId}/validation`);
}

export async function returnWithChanges(clientId: string, formData: FormData) {
  const name = await actorName();
  const note = String(formData.get("note") ?? "").trim();
  if (!note) {
    redirect(
      `/rcic/${clientId}/validation?error=${encodeURIComponent("Add a note before returning with changes.")}`
    );
  }
  const result = applySubmissionAction(clientId, { type: "return_with_changes", note }, name);

  if (result.error) {
    redirect(`/rcic/${clientId}/validation?error=${encodeURIComponent(result.error)}`);
  }
  refreshViews(clientId);
  redirect(`/rcic/${clientId}/validation`);
}

// R02: RCIC's final approval of the package Admin prepared.
export async function approvePackage(clientId: string, formData: FormData) {
  const name = await actorName();
  const note = String(formData.get("note") ?? "").trim() || undefined;
  const result = applySubmissionAction(clientId, { type: "approve_package", note }, name);

  if (result.error) {
    redirect(`/rcic/${clientId}/validation?error=${encodeURIComponent(result.error)}`);
  }
  refreshViews(clientId);
  redirect(`/rcic/${clientId}/validation`);
}

export async function returnPackageForCorrection(clientId: string, formData: FormData) {
  const name = await actorName();
  const note = String(formData.get("note") ?? "").trim();
  if (!note) {
    redirect(
      `/rcic/${clientId}/validation?error=${encodeURIComponent("Add a note before returning for correction.")}`
    );
  }
  const result = applySubmissionAction(
    clientId,
    { type: "return_package_for_correction", note },
    name
  );

  if (result.error) {
    redirect(`/rcic/${clientId}/validation?error=${encodeURIComponent(result.error)}`);
  }
  refreshViews(clientId);
  redirect(`/rcic/${clientId}/validation`);
}

// R03/R04: recording the actual (external, manual) IRCC submission —
// the flow's FINISH.
export async function recordSubmission(clientId: string, formData: FormData) {
  const name = await actorName();
  const submittedBy = String(formData.get("submittedBy") ?? "").trim() || name;
  const submissionDate = String(formData.get("submissionDate") ?? "").trim();
  const channel = String(formData.get("channel") ?? "").trim();
  const irccReference = String(formData.get("irccReference") ?? "").trim();
  const receiptFileName = String(formData.get("receiptFileName") ?? "").trim() || undefined;

  if (!submissionDate || !channel || !irccReference) {
    redirect(
      `/rcic/${clientId}/validation?error=${encodeURIComponent(
        "Submission date, channel, and IRCC reference are required."
      )}`
    );
  }

  const result = applySubmissionAction(
    clientId,
    { type: "record_submission", submittedBy, submissionDate, channel, irccReference, receiptFileName },
    name
  );

  if (result.error) {
    redirect(`/rcic/${clientId}/validation?error=${encodeURIComponent(result.error)}`);
  }
  refreshViews(clientId);
  redirect(`/rcic/${clientId}/validation`);
}
