import { test } from "node:test";
import assert from "node:assert/strict";
import { validateAccountForm } from "./account-validation.ts";

const VALID = {
  name: "Alice Chang",
  password: "a-long-password",
  confirmPassword: "a-long-password",
  acceptedTerms: true,
};

test("a complete, matching form has no errors", () => {
  assert.deepEqual(validateAccountForm(VALID), {});
});

test("name is required", () => {
  assert.ok(validateAccountForm({ ...VALID, name: "   " }).name);
});

test("password needs at least 12 characters", () => {
  const errors = validateAccountForm({ ...VALID, password: "short", confirmPassword: "short" });
  assert.ok(errors.password);
});

test("confirm password must match", () => {
  assert.ok(validateAccountForm({ ...VALID, confirmPassword: "a-different-one" }).confirmPassword);
});

test("terms must be accepted", () => {
  assert.ok(validateAccountForm({ ...VALID, acceptedTerms: false }).acceptedTerms);
});
