import { test } from "node:test";
import assert from "node:assert/strict";
import { getActivityLogStore } from "./activity-log-store.ts";

test("a client with no entries has an empty log", () => {
  assert.deepEqual(getActivityLogStore().getForClient("uid-activity-empty"), []);
});

test("append adds an entry with a timestamp", () => {
  const clientId = "uid-activity-1";
  getActivityLogStore().append(clientId, "Requirements validated by Jean Martin");

  const entries = getActivityLogStore().getForClient(clientId);
  assert.equal(entries.length, 1);
  assert.equal(entries[0]!.message, "Requirements validated by Jean Martin");
  assert.ok(entries[0]!.timestamp > 0);
});

test("entries come back newest first", () => {
  const clientId = "uid-activity-2";
  const store = getActivityLogStore();
  store.append(clientId, "first");
  store.append(clientId, "second");
  store.append(clientId, "third");

  const entries = store.getForClient(clientId);
  assert.deepEqual(
    entries.map((entry) => entry.message),
    ["third", "second", "first"]
  );
});

test("logs are independent per client", () => {
  getActivityLogStore().append("uid-activity-a", "a's entry");
  getActivityLogStore().append("uid-activity-b", "b's entry");

  assert.equal(getActivityLogStore().getForClient("uid-activity-a").length, 1);
  assert.equal(getActivityLogStore().getForClient("uid-activity-b").length, 1);
});
