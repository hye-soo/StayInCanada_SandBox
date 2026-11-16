import { test } from "node:test";
import assert from "node:assert/strict";
import { isPdfBytes, validateUploadFile } from "./upload-validation.ts";

test("uploads must be a PDF of at most 4 MB", () => {
  assert.equal(validateUploadFile({ name: "bank-statement.pdf", size: 2_400_000, type: "application/pdf" }), undefined);
  assert.equal(validateUploadFile({ name: "SCAN.PDF", size: 100, type: "" }), undefined);
  assert.match(validateUploadFile({ name: "big.pdf", size: 5 * 1024 * 1024, type: "application/pdf" })!, /larger than 4 MB/);
  assert.match(validateUploadFile({ name: "photo.jpg", size: 100, type: "image/jpeg" })!, /PDF/);
  assert.match(validateUploadFile({ name: "empty.pdf", size: 0, type: "application/pdf" })!, /empty/);
});

test("isPdfBytes checks the PDF header, not just the name", () => {
  assert.equal(isPdfBytes(new TextEncoder().encode("%PDF-1.7\n...")), true);
  assert.equal(isPdfBytes(new TextEncoder().encode("<html>not a pdf")), false);
  assert.equal(isPdfBytes(new Uint8Array()), false);
});
