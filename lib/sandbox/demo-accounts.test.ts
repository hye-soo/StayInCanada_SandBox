import { test } from "node:test";
import assert from "node:assert/strict";
import { DEMO_ROLES, getDemoUid } from "./demo-accounts.ts";

test("DEMO_ROLES lists exactly the three app roles", () => {
  assert.deepEqual(DEMO_ROLES, ["client", "admin", "rcic"]);
});

test("getDemoUid reads each role's own env var", () => {
  const env = {
    DEMO_CLIENT_UID: "uid-client",
    DEMO_ADMIN_UID: "uid-admin",
    DEMO_RCIC_UID: "uid-rcic",
  };
  assert.equal(getDemoUid("client", env), "uid-client");
  assert.equal(getDemoUid("admin", env), "uid-admin");
  assert.equal(getDemoUid("rcic", env), "uid-rcic");
});

test("getDemoUid returns undefined when the env var is not set", () => {
  assert.equal(getDemoUid("client", {}), undefined);
});
