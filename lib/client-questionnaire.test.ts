import { test } from "node:test";
import assert from "node:assert/strict";
import { saveClientIntakeStep } from "./client-questionnaire.ts";
import { getQuestionnaireFlagStore } from "./questionnaire-flag-store.ts";

test("resaving a step in a flagged category clears that category's flag", () => {
  const clientId = "uid-cq-flag-clear";
  getQuestionnaireFlagStore().setFlag(clientId, "personal", "Expiry date looks wrong.");

  saveClientIntakeStep(clientId, "passport", { values: { passportNumber: "X123" } });

  assert.equal(getQuestionnaireFlagStore().getFlags(clientId).personal, undefined);
});
