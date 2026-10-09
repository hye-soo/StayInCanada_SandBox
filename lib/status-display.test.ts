import { test } from "node:test";
import assert from "node:assert/strict";
import { STATUS_BADGE_CLASS, STATUS_LABEL, STATUS_NEXT_STEP } from "./status-display.ts";

const ALL_STATUSES = [
  "required",
  "submitted",
  "under_review",
  "changes_required",
  "approved",
] as const;

test("every status has a label and a distinct badge class", () => {
  const seenClasses = new Set<string>();

  for (const status of ALL_STATUSES) {
    assert.ok(STATUS_LABEL[status], `missing label for ${status}`);

    const badgeClass = STATUS_BADGE_CLASS[status];
    assert.ok(badgeClass, `missing badge class for ${status}`);
    assert.ok(!seenClasses.has(badgeClass), `duplicate badge class for ${status}`);
    seenClasses.add(badgeClass);
  }
});

test("badge classes reference the status's own bg and foreground tokens", () => {
  for (const status of ALL_STATUSES) {
    const tokenName = status.replace(/_/g, "-");
    const badgeClass = STATUS_BADGE_CLASS[status];
    assert.ok(badgeClass.includes(`bg-status-${tokenName}`));
    assert.ok(badgeClass.includes(`text-status-${tokenName}-foreground`));
  }
});

test("every status has a next-step entry with a valid whoseTurn", () => {
  const validTurns = new Set(["client", "staff", "none"]);
  for (const status of ALL_STATUSES) {
    const nextStep = STATUS_NEXT_STEP[status];
    assert.ok(nextStep, `missing next-step entry for ${status}`);
    assert.ok(validTurns.has(nextStep.whoseTurn), `invalid whoseTurn for ${status}`);
    assert.ok(nextStep.whatHappensNext, `missing whatHappensNext for ${status}`);
  }
});
