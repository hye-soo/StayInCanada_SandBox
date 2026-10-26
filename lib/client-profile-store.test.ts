import { test } from "node:test";
import assert from "node:assert/strict";
import { getClientProfileStore } from "./client-profile-store.ts";

test("a never-before-seen client gets a default profile", () => {
  const store = getClientProfileStore();
  const profile = store.getProfile("uid-profile-1");
  assert.ok(profile.assignedAdvisorName);
});

test("the same client's profile persists across repeated access", () => {
  const store = getClientProfileStore();
  assert.equal(store.getProfile("uid-profile-2").assignedAdvisorName, store.getProfile("uid-profile-2").assignedAdvisorName);
});
