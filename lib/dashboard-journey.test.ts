import { test } from "node:test";
import assert from "node:assert/strict";
import { getJourneyStep } from "./dashboard-journey.ts";

const base = {
  incompleteSections: 0,
  required: 0,
  changesRequired: 0,
  allApproved: false,
  submissionState: "awaiting_validation" as const,
};

test("incomplete intake sections put the client on step 2 (Intake), owned by them", () => {
  const step = getJourneyStep({ ...base, incompleteSections: 2 });
  assert.equal(step.stepIndex, 2);
  assert.equal(step.owner, "You");
});

test("required or changed documents put the client on step 3 (Documents), owned by them", () => {
  assert.equal(getJourneyStep({ ...base, required: 1 }).stepIndex, 3);
  assert.equal(getJourneyStep({ ...base, changesRequired: 1 }).owner, "You");
});

test("all documents approved and awaiting validation is step 4 (Validation), owned by the team", () => {
  const step = getJourneyStep({ ...base, allApproved: true });
  assert.equal(step.stepIndex, 4);
  assert.equal(step.owner, "Your team");
});

test("documents still under review (not all approved yet) stay on step 3, owned by the team", () => {
  const step = getJourneyStep({ ...base, allApproved: false });
  assert.equal(step.stepIndex, 3);
  assert.equal(step.owner, "Your team");
});

test("any submission state past validation is step 5 (Applying), owned by the team", () => {
  for (const submissionState of ["validated", "package_prepared", "approved_for_submission", "submitted_to_ircc"] as const) {
    const step = getJourneyStep({ ...base, submissionState });
    assert.equal(step.stepIndex, 5, submissionState);
    assert.equal(step.owner, "Your team");
  }
});
