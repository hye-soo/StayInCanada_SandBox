import { test } from "node:test";
import assert from "node:assert/strict";
import { INTAKE_STEPS } from "./intake-steps.ts";
import { getIntakeProgress, getStepStatus } from "../intake.ts";
import { SAMPLE_INTAKE } from "./sample-intake.ts";

test("sample intake completes every step", () => {
  for (const step of INTAKE_STEPS) {
    assert.equal(getStepStatus(step, SAMPLE_INTAKE[step.id]), "complete", step.id);
  }
  assert.equal(getIntakeProgress(SAMPLE_INTAKE).percent, 100);
});

test("sample select answers are real options", () => {
  for (const step of INTAKE_STEPS) {
    const answer = SAMPLE_INTAKE[step.id];
    for (const source of [answer?.values ?? {}, ...(answer?.entries ?? [])]) {
      for (const field of step.fields) {
        const value = source[field.name];
        if (field.options && value) assert.ok(field.options.includes(value), `${step.id}.${field.name}=${value}`);
      }
    }
  }
});
