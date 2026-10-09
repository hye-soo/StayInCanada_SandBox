import { test } from "node:test";
import assert from "node:assert/strict";
import { can } from "./permissions.ts";
import type { UserRole } from "./types.ts";

// Draft matrix to confirm with the team (per the sandbox experiment
// request) — this test IS the matrix, kept in sync with lib/permissions.ts.
const MATRIX: Record<UserRole, Record<string, boolean>> = {
  client: {
    uploadOwnDocument: true,
    viewOwnChecklist: true,
    viewAllChecklists: false,
    requestChanges: false,
    approve: false,
  },
  rcic: {
    uploadOwnDocument: false,
    viewOwnChecklist: false,
    viewAllChecklists: true,
    requestChanges: true,
    approve: true,
  },
  admin: {
    uploadOwnDocument: false,
    viewOwnChecklist: false,
    viewAllChecklists: true,
    requestChanges: true,
    approve: false,
  },
};

for (const [role, actions] of Object.entries(MATRIX) as [UserRole, Record<string, boolean>][]) {
  for (const [action, expected] of Object.entries(actions)) {
    test(`${role} ${expected ? "can" : "cannot"} ${action}`, () => {
      assert.equal(can(role, action as Parameters<typeof can>[1]), expected);
    });
  }
}

test("admin specifically cannot approve, even though it can view and request changes", () => {
  assert.equal(can("admin", "viewAllChecklists"), true);
  assert.equal(can("admin", "requestChanges"), true);
  assert.equal(can("admin", "approve"), false);
});
