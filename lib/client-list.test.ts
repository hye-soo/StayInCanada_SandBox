import { test } from "node:test";
import assert from "node:assert/strict";
import { filterClientRows, paginate, type ClientListRow } from "./client-list.ts";

const ROWS: ClientListRow[] = [
  {
    clientId: "a",
    name: "Alice Chang",
    email: "alice@example.com",
    applicationId: "FO-2026-014",
    applicationType: "Study permit extension",
    stageLabel: "Gathering information",
    nextAction: "Waiting on client",
    needsAttention: true,
    assignedToMe: true,
  },
  {
    clientId: "b",
    name: "Jordan Lee",
    email: "jordan@example.com",
    applicationId: "FO-2026-021",
    applicationType: "Work permit",
    stageLabel: "Submitted",
    nextAction: "Submitted to IRCC — no action needed",
    needsAttention: false,
    assignedToMe: false,
  },
];

test("search matches name, email or application ID, ignoring case", () => {
  assert.deepEqual(filterClientRows(ROWS, { q: "alice" }).map((r) => r.clientId), ["a"]);
  assert.deepEqual(filterClientRows(ROWS, { q: "JORDAN@" }).map((r) => r.clientId), ["b"]);
  assert.deepEqual(filterClientRows(ROWS, { q: "2026-021" }).map((r) => r.clientId), ["b"]);
});

test("status and application type filters narrow the list", () => {
  assert.deepEqual(filterClientRows(ROWS, { status: "needs_attention" }).map((r) => r.clientId), ["a"]);
  assert.deepEqual(filterClientRows(ROWS, { applicationType: "Work permit" }).map((r) => r.clientId), ["b"]);
  assert.deepEqual(filterClientRows(ROWS, { assigned: "me" }).map((r) => r.clientId), ["a"]);
  assert.equal(filterClientRows(ROWS, {}).length, 2);
});

test("pages of seven, clamped to the last page", () => {
  const many = Array.from({ length: 16 }, (_, index) => ({ ...ROWS[0]!, clientId: String(index) }));
  assert.deepEqual(paginate(many, 1), { items: many.slice(0, 7), page: 1, pageCount: 3 });
  assert.equal(paginate(many, 3).items.length, 2);
  assert.equal(paginate(many, 9).page, 3);
  assert.deepEqual(paginate([], 1), { items: [], page: 1, pageCount: 1 });
});
