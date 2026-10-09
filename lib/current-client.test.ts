import { test } from "node:test";
import assert from "node:assert/strict";
import { getCurrentClient } from "./current-client.ts";

test("getCurrentClient returns a mock client with the client role", () => {
  const client = getCurrentClient();
  assert.equal(client.role, "client");
  assert.equal(client.visaType, "student");
  assert.ok(client.id);
  assert.ok(client.name);
});
