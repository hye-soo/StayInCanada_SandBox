import { test } from "node:test";
import assert from "node:assert/strict";
import { applyChecklistAction } from "./apply-checklist-action.ts";
import { getChecklistStore } from "./checklist-store.ts";
import { getActivityLogStore } from "./activity-log-store.ts";
import { getNotificationStore } from "./notification-store.ts";
import { getMemoStore } from "./memo-store.ts";

test("returns an error for an unknown item id", () => {
  const result = applyChecklistAction("uid-apply-1", "not-a-real-item", { type: "approve" });
  assert.ok(result.error);
});

test("applies a valid action and persists it via the store, scoped to the right client", () => {
  const result = applyChecklistAction("uid-apply-2", "proof-of-funds", {
    type: "request_changes",
    comment: "Bank letter is expired.",
  });

  assert.equal(result.error, undefined);
  assert.equal(result.item?.status, "changes_required");

  const persisted = getChecklistStore().getItem("uid-apply-2", "proof-of-funds");
  assert.equal(persisted?.status, "changes_required");
  assert.equal(persisted?.staffComment, "Bank letter is expired.");

  // A different client's copy of the same item id is untouched.
  const otherClient = getChecklistStore().getItem("uid-apply-3", "proof-of-funds");
  assert.equal(otherClient?.status, "required");
});

test("does not persist anything when the action is rejected", () => {
  const before = getChecklistStore().getItem("uid-apply-4", "language-test");
  const result = applyChecklistAction("uid-apply-4", "language-test", {
    type: "upload",
    file: { name: "huge.pdf", size: 10 * 1024 * 1024 },
  });

  assert.ok(result.error);
  const after = getChecklistStore().getItem("uid-apply-4", "language-test");
  assert.deepEqual(after, before);
});

test("request_changes logs a mocked client email and notifies the client with a deep link", () => {
  applyChecklistAction(
    "uid-apply-5",
    "proof-of-funds",
    { type: "request_changes", comment: "Missing a page." },
    "Alex Morgan"
  );

  const log = getActivityLogStore().getForClient("uid-apply-5");
  assert.match(log[0]!.message, /Alex Morgan requested changes.*mocked/);

  const notification = getNotificationStore().getForRecipient("uid-apply-5")[0];
  assert.match(notification!.message, /Alex Morgan/);
  assert.equal(notification!.href, "/checklist/proof-of-funds");
});

test("flag_for_admin notifies Admin's shared inbox, not the client", () => {
  applyChecklistAction(
    "uid-apply-6",
    "proof-of-funds",
    { type: "flag_for_admin", note: "Name mismatch." },
    "Jean Martin"
  );

  const clientNotifications = getNotificationStore().getForRecipient("uid-apply-6");
  assert.equal(clientNotifications.length, 0);

  const adminNotification = getNotificationStore().getForRecipient("admin")[0];
  assert.equal(adminNotification!.href, "/admin/uid-apply-6");
});

test("mark_reviewed notifies RCIC's shared inbox", () => {
  applyChecklistAction("uid-apply-7", "proof-of-funds", { type: "mark_reviewed" }, "Alex Morgan");

  const rcicNotification = getNotificationStore().getForRecipient("rcic")[0];
  assert.equal(rcicNotification!.href, "/rcic/uid-apply-7");
});

test("approve tells the client with an update (Memo & Updates), nothing to act on", () => {
  applyChecklistAction("uid-apply-8", "proof-of-funds", { type: "approve" }, "Jean Martin");
  const updates = getNotificationStore().getForRecipient("uid-apply-8");
  assert.equal(updates.length, 1);
  assert.equal(updates[0]!.message, "Your proof of financial support was approved");
  assert.match(updates[0]!.detail ?? "", /No action is needed/);
});

test("request changes also opens a staff memo the client can reply to", () => {
  applyChecklistAction("uid-apply-memo", "passport", { type: "upload", file: { name: "p.pdf", size: 10 } });
  applyChecklistAction("uid-apply-memo", "passport", { type: "request_changes", comment: "Scan is blurry." }, "Alex Morgan");
  const [memo] = getMemoStore().list("uid-apply-memo");
  assert.equal(memo?.subject, "Passport needs replacing");
  assert.equal(memo?.messages[0]?.body, "Scan is blurry.");
  assert.equal(memo?.waitingOn, "client");
});

test("an upload records when it was received and notifies Admin to quality-check it", () => {
  const before = Date.now();
  applyChecklistAction("uid-apply-received", "passport", {
    type: "upload",
    file: { name: "passport.pdf", size: 1000 },
  });

  const item = getChecklistStore().getItem("uid-apply-received", "passport");
  assert.ok(item?.submittedAt && item.submittedAt >= before);
  const [latest] = getNotificationStore().getForRecipient("admin");
  assert.equal(latest?.href, "/admin/uid-apply-received");
});
