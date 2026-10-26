import { test } from "node:test";
import assert from "node:assert/strict";
import { transitionSubmission } from "./application-submission-transitions.ts";
import type { ApplicationSubmission } from "./application-submission-transitions.ts";

function submission(state: ApplicationSubmission["state"]): ApplicationSubmission {
  return { state };
}

test("validate moves awaiting_validation -> validated, keeping the note", () => {
  const result = transitionSubmission(submission("awaiting_validation"), {
    type: "validate",
    note: "Looks good.",
  });
  assert.equal(result.submission?.state, "validated");
  assert.equal(result.submission?.lastNote, "Looks good.");
  assert.equal(result.error, undefined);
});

test("validate is rejected outside awaiting_validation", () => {
  assert.ok(transitionSubmission(submission("validated"), { type: "validate" }).error);
});

test("return_with_changes keeps the state but records the note", () => {
  const result = transitionSubmission(submission("awaiting_validation"), {
    type: "return_with_changes",
    note: "Passport version mismatch.",
  });
  assert.equal(result.submission?.state, "awaiting_validation");
  assert.equal(result.submission?.lastNote, "Passport version mismatch.");
});

test("prepare_package moves validated -> package_prepared and records version/preparer", () => {
  const result = transitionSubmission(submission("validated"), {
    type: "prepare_package",
    preparedBy: "Alex Morgan",
  });
  assert.equal(result.submission?.state, "package_prepared");
  assert.equal(result.submission?.package?.version, 1);
  assert.equal(result.submission?.package?.preparedBy, "Alex Morgan");
});

test("prepare_package is rejected outside validated", () => {
  assert.ok(
    transitionSubmission(submission("awaiting_validation"), {
      type: "prepare_package",
      preparedBy: "Alex Morgan",
    }).error
  );
});

test("a second prepare_package increments the version", () => {
  const first = transitionSubmission(submission("validated"), {
    type: "prepare_package",
    preparedBy: "Alex Morgan",
  }).submission!;
  // Simulate RCIC returning it for correction, then Admin re-preparing.
  const returned = transitionSubmission(first, {
    type: "return_package_for_correction",
    note: "Missing signature.",
  }).submission!;
  const second = transitionSubmission(returned, {
    type: "prepare_package",
    preparedBy: "Alex Morgan",
  });
  assert.equal(second.submission?.package?.version, 2);
});

test("approve_package moves package_prepared -> approved_for_submission", () => {
  const prepared = transitionSubmission(submission("validated"), {
    type: "prepare_package",
    preparedBy: "Alex Morgan",
  }).submission!;
  const result = transitionSubmission(prepared, {
    type: "approve_package",
    note: "Ready to go.",
  });
  assert.equal(result.submission?.state, "approved_for_submission");
});

test("return_package_for_correction moves package_prepared back to validated", () => {
  const prepared = transitionSubmission(submission("validated"), {
    type: "prepare_package",
    preparedBy: "Alex Morgan",
  }).submission!;
  const result = transitionSubmission(prepared, {
    type: "return_package_for_correction",
    note: "Missing signature.",
  });
  assert.equal(result.submission?.state, "validated");
});

test("record_submission moves approved_for_submission -> submitted_to_ircc and stores the record", () => {
  const approved: ApplicationSubmission = { state: "approved_for_submission" };
  const result = transitionSubmission(approved, {
    type: "record_submission",
    submittedBy: "Jean Martin",
    submissionDate: "2026-10-20",
    channel: "IRCC online account",
    irccReference: "DEMO-2026-014",
    receiptFileName: "submission-confirmation.pdf",
  });
  assert.equal(result.submission?.state, "submitted_to_ircc");
  assert.equal(result.submission?.record?.irccReference, "DEMO-2026-014");
  assert.equal(result.submission?.record?.channel, "IRCC online account");
});

test("record_submission is rejected outside approved_for_submission", () => {
  assert.ok(
    transitionSubmission(submission("package_prepared"), {
      type: "record_submission",
      submittedBy: "Jean Martin",
      submissionDate: "2026-10-20",
      channel: "IRCC online account",
      irccReference: "DEMO-2026-014",
    }).error
  );
});
