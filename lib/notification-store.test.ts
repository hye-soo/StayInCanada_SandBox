import { test } from "node:test";
import assert from "node:assert/strict";
import { getNotificationStore } from "./notification-store.ts";

test("a recipient with no notifications gets an empty list", () => {
  assert.deepEqual(getNotificationStore().getForRecipient("uid-notif-empty"), []);
});

test("created notifications are newest-first and start unread", () => {
  const store = getNotificationStore();
  store.create("uid-notif-1", "first", "/a");
  store.create("uid-notif-1", "second", "/b");

  const [latest, earliest] = store.getForRecipient("uid-notif-1");
  assert.equal(latest?.message, "second");
  assert.equal(earliest?.message, "first");
  assert.equal(latest?.readAt, undefined);
});

test("markRead sets readAt only for that recipient's notification", () => {
  const store = getNotificationStore();
  store.create("uid-notif-2", "hello", "/x");
  const [notification] = store.getForRecipient("uid-notif-2");

  store.markRead("uid-notif-2", notification!.id);

  assert.ok(store.getForRecipient("uid-notif-2")[0]?.readAt);
});

test("recipients are independent", () => {
  const store = getNotificationStore();
  store.create("uid-notif-3a", "for a", "/a");
  store.create("uid-notif-3b", "for b", "/b");

  assert.equal(store.getForRecipient("uid-notif-3a").length, 1);
  assert.equal(store.getForRecipient("uid-notif-3b").length, 1);
});

test("a notification can carry an optional detail line", () => {
  const store = getNotificationStore();
  store.create("uid-notif-detail", "Welcome to FlowOui!", "/dashboard", "Your account is ready.");
  assert.equal(store.getForRecipient("uid-notif-detail")[0]?.detail, "Your account is ready.");
});
