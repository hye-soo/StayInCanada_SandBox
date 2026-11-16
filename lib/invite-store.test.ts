import { test } from "node:test";
import assert from "node:assert/strict";
import { getInviteStore, isInviteValid } from "./invite-store.ts";

test("create returns an invite with a token and the given email, unused", () => {
  const invite = getInviteStore().create("client@example.com");
  assert.ok(invite.token);
  assert.equal(invite.email, "client@example.com");
  assert.equal(invite.usedAt, undefined);
});

test("get finds a created invite by token", () => {
  const created = getInviteStore().create("find-me@example.com");
  const found = getInviteStore().get(created.token);
  assert.equal(found?.email, "find-me@example.com");
});

test("get returns undefined for an unknown token", () => {
  assert.equal(getInviteStore().get("not-a-real-token"), undefined);
});

test("markUsed sets usedAt on the invite", () => {
  const invite = getInviteStore().create("use-me@example.com");
  getInviteStore().markUsed(invite.token);
  const updated = getInviteStore().get(invite.token);
  assert.ok(updated?.usedAt);
});

test("two created invites get distinct tokens", () => {
  const a = getInviteStore().create("a@example.com");
  const b = getInviteStore().create("b@example.com");
  assert.notEqual(a.token, b.token);
});

test("an invite carries the client's name when one is given", () => {
  const invite = getInviteStore().create("named@example.com", "Named Client");
  assert.equal(getInviteStore().get(invite.token)?.name, "Named Client");
});

test("the mock invitation for Alice is seeded", () => {
  const invite = getInviteStore().get("welcome-alice");
  assert.equal(invite?.name, "Alice Chang");
  assert.equal(isInviteValid(invite), true);
});

test("isInviteValid: true for an unused invite, false for missing/used", () => {
  const invite = getInviteStore().create("valid@example.com");
  assert.equal(isInviteValid(invite), true);
  assert.equal(isInviteValid(undefined), false);

  getInviteStore().markUsed(invite.token);
  assert.equal(isInviteValid(getInviteStore().get(invite.token)), false);
});

// Keep last: resetting replaces the shared store other tests write to.
test("resetInviteStore makes a used seeded invite valid again", async () => {
  const { resetInviteStore } = await import("./invite-store.ts");
  getInviteStore().markUsed("welcome-alice");
  resetInviteStore();
  assert.equal(isInviteValid(getInviteStore().get("welcome-alice")), true);
});
