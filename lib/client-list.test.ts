import { test } from "node:test";
import assert from "node:assert/strict";
import { filterClientRows, type ClientListRow } from "./client-list.ts";

const ROWS: ClientListRow[] = [
  {
    clientId: "a",
    name: "Alice Chang",
    email: "alice@example.com",
    applicationId: "FO-2026-014",
    visaType: "student",
    visaTypeLabel: "Study permit extension",
    stageLabel: "Gathering information",
    nextAction: "Waiting on client",
    needsAttention: true,
  },
  {
    clientId: "b",
    name: "Jordan Lee",
    email: "jordan@example.com",
    applicationId: "FO-2026-021",
    visaType: "student",
    visaTypeLabel: "Study permit extension",
    stageLabel: "Submitted",
    nextAction: "Submitted to IRCC — no action needed",
    needsAttention: false,
  },
];

test("search matches name, email or application ID, ignoring case", () => {
  assert.deepEqual(filterClientRows(ROWS, { q: "alice" }).map((r) => r.clientId), ["a"]);
  assert.deepEqual(filterClientRows(ROWS, { q: "JORDAN@" }).map((r) => r.clientId), ["b"]);
  assert.deepEqual(filterClientRows(ROWS, { q: "2026-021" }).map((r) => r.clientId), ["b"]);
});

test("status and application type filters narrow the list", () => {
  assert.deepEqual(filterClientRows(ROWS, { status: "needs_attention" }).map((r) => r.clientId), ["a"]);
  assert.equal(filterClientRows(ROWS, { visaType: "student" }).length, 2);
  assert.equal(filterClientRows(ROWS, {}).length, 2);
});
