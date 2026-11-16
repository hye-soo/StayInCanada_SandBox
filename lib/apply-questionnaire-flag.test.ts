import { test } from "node:test";
import assert from "node:assert/strict";
import { flagIntakeCategory } from "./apply-questionnaire-flag.ts";
import { getQuestionnaireFlagStore } from "./questionnaire-flag-store.ts";
import { getActivityLogStore } from "./activity-log-store.ts";
import { getNotificationStore } from "./notification-store.ts";

test("flagging a section persists the note, logs a mocked email, and notifies the client", () => {
  const clientId = "uid-qflag-apply-1";
  flagIntakeCategory(clientId, "personal", "Expiry date looks wrong.", "Alex Morgan");

  assert.equal(getQuestionnaireFlagStore().getFlags(clientId).personal, "Expiry date looks wrong.");

  const log = getActivityLogStore().getForClient(clientId);
  assert.match(log[0]!.message, /Alex Morgan flagged "Personal".*mocked/);

  const notification = getNotificationStore().getForRecipient(clientId)[0];
  assert.match(notification!.message, /Alex Morgan/);
  assert.equal(notification!.href, "/questionnaire/legal-identity");
});

test("sending a section back clears its reviewed mark", async () => {
  const { getIntakeReviewStore } = await import("./intake-review-store.ts");
  const clientId = "uid-qflag-apply-reviewed";
  getIntakeReviewStore().markReviewed(clientId, "personal");

  flagIntakeCategory(clientId, "personal", "Wrong number.", "Alex Morgan");

  assert.equal(getIntakeReviewStore().getReviewed(clientId).has("personal"), false);
});
