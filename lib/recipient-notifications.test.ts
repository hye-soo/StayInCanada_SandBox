import { test } from "node:test";
import assert from "node:assert/strict";
import { recipientIdFor, getUnreadCount } from "./recipient-notifications.ts";
import { getNotificationStore } from "./notification-store.ts";
import type { SessionUser } from "./firebase/session.ts";

function session(overrides: Partial<SessionUser>): SessionUser {
  return { uid: "uid-x", role: "client", email: undefined, displayName: undefined, ...overrides };
}

test("a client's recipient id is their own uid", () => {
  assert.equal(recipientIdFor(session({ role: "client", uid: "uid-123" })), "uid-123");
});

test("staff share one inbox per role, not per uid", () => {
  assert.equal(recipientIdFor(session({ role: "admin", uid: "uid-admin-1" })), "admin");
  assert.equal(recipientIdFor(session({ role: "rcic", uid: "uid-rcic-1" })), "rcic");
});

test("getUnreadCount only counts notifications without a readAt", () => {
  const store = getNotificationStore();
  store.create("uid-unread-1", "a", "/a");
  store.create("uid-unread-1", "b", "/b");
  const [unread] = store.getForRecipient("uid-unread-1");
  store.markRead("uid-unread-1", unread!.id);

  assert.equal(getUnreadCount(session({ uid: "uid-unread-1" })), 1);
});
