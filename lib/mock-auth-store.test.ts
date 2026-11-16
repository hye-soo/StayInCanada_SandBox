import { test } from "node:test";
import assert from "node:assert/strict";
import { createMockAuthStore } from "./mock-auth-store.ts";
import type { MockUser } from "./data/mock-users.ts";

function seed(): MockUser[] {
  return [
    { id: "c1", role: "client", name: "Alice", email: "alice@example.com", password: null },
    { id: "s1", role: "admin", name: "Maya", email: "maya@example.com", password: "staff-password" },
  ];
}

test("sign-in succeeds with the right email (any case) and password", () => {
  const result = createMockAuthStore(seed()).signIn("MAYA@example.com", "staff-password");
  assert.ok("user" in result && result.user.id === "s1");
});

test("unknown email, wrong password and not-yet-activated accounts are told apart", () => {
  const store = createMockAuthStore(seed());
  assert.deepEqual(store.signIn("nobody@example.com", "x"), { error: "no_account" });
  assert.deepEqual(store.signIn("maya@example.com", "nope"), { error: "wrong_password" });
  assert.deepEqual(store.signIn("alice@example.com", "anything"), { error: "not_activated" });
});

test("activating an invited client sets their name and password so they can sign in", () => {
  const store = createMockAuthStore(seed());
  const user = store.activateClient({
    email: "alice@example.com",
    name: "Alice Chang",
    password: "alice-password",
  });

  assert.equal(user.id, "c1");
  assert.equal(user.name, "Alice Chang");
  assert.ok("user" in store.signIn("alice@example.com", "alice-password"));
});

test("activating an email with no seeded user creates a new client", () => {
  const store = createMockAuthStore(seed());
  const user = store.activateClient({
    email: "new@example.com",
    name: "New Client",
    password: "new-password-1",
  });

  assert.equal(user.role, "client");
  assert.equal(store.findById(user.id)?.email, "new@example.com");
});

test("seed data is copied, not mutated", () => {
  const users = seed();
  createMockAuthStore(users).activateClient({
    email: "alice@example.com",
    name: "Changed",
    password: "alice-password",
  });
  assert.equal(users[0]?.password, null);
});

test("resetMockAuthStore puts the seeded users back as they were", async () => {
  const { getMockAuthStore, resetMockAuthStore } = await import("./mock-auth-store.ts");
  getMockAuthStore().activateClient({
    email: "alice@example.com",
    name: "Alice Chang",
    password: "alice-password-1",
  });
  resetMockAuthStore();
  assert.ok(!("user" in getMockAuthStore().signIn("alice@example.com", "alice-password-1")));
});
